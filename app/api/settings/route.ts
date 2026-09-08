import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CONTACT_CONFIG, getWhatsAppChatUrl } from "@/lib/site-config";

export async function GET() {
    try {
        const settings = await prisma.settings.findUnique({
            where: { id: "site-settings" }
        });

        const activeNumber = settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || CONTACT_CONFIG.salesWhatsApp;

        return NextResponse.json({
            whatsappNumber: activeNumber,
            footerWhatsappUrl: settings?.footerWhatsappUrl || getWhatsAppChatUrl(activeNumber),
            footerBrandTitle: settings?.footerBrandTitle || "Hawa Distribution",
            footerBrandTitleAr: settings?.footerBrandTitleAr || "شركة حوا للتوزيع والتجارة",
        });
    } catch (error) {
        console.error("Fetch settings error:", error);
        return NextResponse.json({
            whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || CONTACT_CONFIG.salesWhatsApp,
            footerWhatsappUrl: getWhatsAppChatUrl(CONTACT_CONFIG.salesWhatsApp),
            footerBrandTitle: "Hawa Distribution",
            footerBrandTitleAr: "شركة حوا للتوزيع والتجارة",
        });
    }
}
