import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function sanitizeString(val: unknown, maxLen = 300): string {
    if (typeof val !== 'string') return '';
    return val
        .replace(/<[^>]*>?/gm, '') // Strip HTML tags
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Strip control chars
        .trim()
        .slice(0, maxLen);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId, rating, feedback, image, name, email } = body;

        const cleanName = sanitizeString(name, 100);
        const cleanFeedback = sanitizeString(feedback, 1000);
        const cleanEmail = email ? sanitizeString(email, 120) : null;
        const numericRating = Math.max(1, Math.min(5, parseInt(rating) || 5));

        if (!productId || typeof productId !== 'string' || !cleanName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Validate image URL format to prevent javascript: or malformed payload injection
        let cleanImage: string | null = null;
        if (image && typeof image === 'string') {
            const trimmedImage = image.trim();
            if (/^(https?:\/\/|\/uploads\/)/i.test(trimmedImage)) {
                cleanImage = trimmedImage.slice(0, 500);
            }
        }

        const review = await prisma.review.create({
            data: {
                productId: productId.trim(),
                rating: numericRating,
                feedback: cleanFeedback || null,
                image: cleanImage,
                name: cleanName,
                email: cleanEmail,
                isApproved: false, // Default to false
            }
        });

        return NextResponse.json({ success: true, review }, { status: 201 });
    } catch (error) {
        console.error("Error creating review:", error);
        return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const productId = searchParams.get("productId");

        if (!productId) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        const reviews = await prisma.review.findMany({
            where: {
                productId,
                isApproved: true,
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        const response = NextResponse.json(reviews);
        response.headers.set(
            "Cache-Control",
            "public, s-maxage=300, stale-while-revalidate=3600"
        );
        return response;
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}
