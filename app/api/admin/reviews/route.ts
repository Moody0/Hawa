import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
    try {
        await requireAdminSession("canManageReviews");
    } catch (authError: any) {
        return NextResponse.json({ error: authError?.message || "Unauthorized" }, { status: 401 });
    }
    try {

        const reviews = await prisma.review.findMany({
            include: {
                product: {
                    select: {
                        name: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Error fetching admin reviews:", error);
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}
