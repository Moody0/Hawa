import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    getClientIp,
    checkRateLimit,
    checkRequestBodyLimit,
    recordSecurityMetric,
} from "@/lib/rate-limit";

function sanitizeString(val: unknown, maxLen = 300): string {
    if (typeof val !== "string") return "";
    return val
        .replace(/<[^>]*>?/gm, "") // Strip HTML tags
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Strip control chars
        .trim()
        .slice(0, maxLen);
}

export async function POST(request: NextRequest) {
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || undefined;

    // 1. Enforce request body size limit (50KB)
    if (!checkRequestBodyLimit(request, 50 * 1024)) {
        recordSecurityMetric({ action: "contact_submission", ip, status: "blocked", reason: "payload_too_large" });
        return NextResponse.json(
            { error: "Payload too large" },
            { status: 413 }
        );
    }

    // 2. IP-level burst limit: max 5 submissions per 10 minutes per IP
    const burstLimit = checkRateLimit(`contact:ip:${ip}`, 5, 10 * 60 * 1000);
    if (!burstLimit.allowed) {
        recordSecurityMetric({ action: "contact_submission", ip, status: "blocked", reason: "ip_rate_limit_exceeded" });
        return NextResponse.json(
            { error: `Too many submissions. Please wait ${burstLimit.retryAfterSeconds} seconds before trying again.` },
            {
                status: 429,
                headers: { "Retry-After": String(burstLimit.retryAfterSeconds) },
            }
        );
    }

    try {
        const body = await request.json();
        const {
            name,
            phone,
            shopName,
            city,
            message,
            _hp_company, // Honeypot field
            _ts, // Render timestamp
        } = body;

        // 3. Honeypot check: bots fill hidden fields
        if (_hp_company && typeof _hp_company === "string" && _hp_company.trim().length > 0) {
            recordSecurityMetric({ action: "contact_submission", ip, status: "blocked", reason: "honeypot_triggered" });
            // Silently return success to mislead bots
            return NextResponse.json({ success: true, message: "Message sent successfully" });
        }

        // 4. Minimum time-to-submit verification (must take at least 2 seconds)
        if (_ts) {
            const elapsed = Date.now() - Number(_ts);
            if (!isNaN(elapsed) && elapsed < 2000) {
                recordSecurityMetric({ action: "contact_submission", ip, status: "blocked", reason: "bot_fast_submission" });
                // Silently return success to mislead instant-fill bots
                return NextResponse.json({ success: true, message: "Message sent successfully" });
            }
        }

        // 5. Sanitization & length guards
        const cleanName = sanitizeString(name, 100);
        const cleanPhone = sanitizeString(phone, 35);
        const cleanShopName = shopName ? sanitizeString(shopName, 120) : null;
        const cleanCity = city ? sanitizeString(city, 80) : null;
        const cleanMessage = sanitizeString(message, 3000);

        if (!cleanName || !cleanPhone || !cleanMessage) {
            return NextResponse.json(
                { error: "Name, phone number, and message are required." },
                { status: 400 }
            );
        }

        if (cleanMessage.length < 5) {
            return NextResponse.json(
                { error: "Message must be at least 5 characters long." },
                { status: 400 }
            );
        }

        // 6. Phone-level rate limit: max 3 messages per 10 minutes per phone
        const normalizedDigits = cleanPhone.replace(/[^0-9]/g, "");
        if (normalizedDigits.length >= 7) {
            const phoneLimit = checkRateLimit(`contact:phone:${normalizedDigits}`, 3, 10 * 60 * 1000);
            if (!phoneLimit.allowed) {
                recordSecurityMetric({ action: "contact_submission", ip, status: "blocked", reason: "phone_rate_limit_exceeded" });
                return NextResponse.json(
                    { error: `Too many submissions for this phone number. Please wait ${phoneLimit.retryAfterSeconds} seconds.` },
                    {
                        status: 429,
                        headers: { "Retry-After": String(phoneLimit.retryAfterSeconds) },
                    }
                );
            }
        }

        // 7. Duplicate submission check: prevent identical message from same phone in last 2 minutes
        const recentDuplicate = await prisma.contactMessage.findFirst({
            where: {
                phone: cleanPhone,
                message: cleanMessage,
                createdAt: {
                    gte: new Date(Date.now() - 2 * 60 * 1000),
                },
                archivedAt: null,
            },
        });

        if (recentDuplicate) {
            return NextResponse.json(
                { error: "An identical message was recently sent. Please wait a moment before sending another." },
                { status: 429 }
            );
        }

        // 8. Persist to database
        const savedMessage = await prisma.contactMessage.create({
            data: {
                name: cleanName,
                phone: cleanPhone,
                shopName: cleanShopName,
                city: cleanCity,
                message: cleanMessage,
                ipAddress: ip,
                userAgent: userAgent ? userAgent.slice(0, 300) : null,
            },
        });

        recordSecurityMetric({ action: "contact_submission", ip, status: "success" });

        return NextResponse.json({
            success: true,
            id: savedMessage.id,
            message: "Your message has been sent successfully. We will get back to you shortly.",
        });
    } catch (error) {
        console.error("Failed to process contact message submission:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred while sending your message. Please try again." },
            { status: 500 }
        );
    }
}
