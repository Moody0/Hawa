import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const settings = await prisma.settings.findUnique({
            where: { id: "site-settings" }
        });

        return NextResponse.json({
            whatsappNumber: settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+963900000000",
            footerWhatsappUrl: settings?.footerWhatsappUrl || `https://wa.me/${(settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "963900000000").replace(/[^0-9]/g, '')}`,
            footerBrandTitle: settings?.footerBrandTitle || "Hawa Distribution",
            footerBrandTitleAr: settings?.footerBrandTitleAr || "شركة حوا للتوزيع والتجارة",
        });
    } catch (error) {
        console.error("Fetch settings error:", error);
        return NextResponse.json({
            whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+963900000000",
            footerWhatsappUrl: `https://wa.me/963900000000`,
            footerBrandTitle: "Hawa Distribution",
            footerBrandTitleAr: "شركة حوا للتوزيع والتجارة",
        });
    }
}
