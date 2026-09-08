import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        await requireAdminSession("canManageReviews");
    } catch (authError: any) {
        return NextResponse.json({ error: authError?.message || "Unauthorized" }, { status: 401 });
    }
    try {
        const params = await props.params;
        const body = await request.json();
        const { isApproved } = body;

        if (typeof isApproved !== "boolean") {
            return NextResponse.json({ error: "Invalid approval status" }, { status: 400 });
        }

        const review = await prisma.review.update({
            where: { id: params.id },
            data: { isApproved }
        });

        return NextResponse.json(review);
    } catch (error) {
        console.error("Error updating review:", error);
        return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        await requireAdminSession("canManageReviews");
    } catch (authError: any) {
        return NextResponse.json({ error: authError?.message || "Unauthorized" }, { status: 401 });
    }
    try {
        const params = await props.params;

        await prisma.review.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting review:", error);
        return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
    }
}
