/**
 * Inventory Transition Contract & State Machine
 *
 * Implements Phase 3.1 of the Website Audit Implementation Plan.
 *
 * Rules:
 * 1. Submission: Reserving stock occurs at order submission.
 * 2. Delivery: Moving to DELIVERED or COMPLETED incurs NO additional stock deduction.
 * 3. Cancellation / Deletion: Releasing an active reservation occurs exactly once.
 * 4. Terminal & Reverse Transitions: DELIVERED, COMPLETED, and CANCELLED cannot arbitrarily reverse.
 * 5. Idempotency: Transitioning to the current status is a safe no-op with zero inventory movement.
 */

export type OrderStatusType =
    | "PENDING"
    | "CONTACTED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED";

export type InventoryAction = "NONE" | "RELEASE_RESERVATION";

export interface TransitionEvaluation {
    allowed: boolean;
    isNoOp: boolean;
    inventoryAction: InventoryAction;
    error?: string;
}

export interface DeletionEvaluation {
    allowed: boolean;
    inventoryAction: InventoryAction;
    error?: string;
}

/**
 * Evaluates a proposed order status transition according to inventory reservation rules.
 *
 * @param currentStatus - The current status of the order.
 * @param targetStatus - The requested status of the order.
 * @param stockReserved - Whether the order currently holds an active stock reservation.
 */
export function evaluateOrderStatusTransition(
    currentStatus: OrderStatusType,
    targetStatus: OrderStatusType,
    stockReserved: boolean
): TransitionEvaluation {
    // 1. Idempotency: Same status transition is always a no-op
    if (currentStatus === targetStatus) {
        return {
            allowed: true,
            isNoOp: true,
            inventoryAction: "NONE",
        };
    }

    // 2. Terminal state: CANCELLED cannot transition to anything
    if (currentStatus === "CANCELLED") {
        return {
            allowed: false,
            isNoOp: false,
            inventoryAction: "NONE",
            error: "لا يمكن تعديل حالة طلب ملغى مسبقاً (Cannot modify a cancelled order).",
        };
    }

    // 3. Terminal state: COMPLETED cannot transition to anything
    if (currentStatus === "COMPLETED") {
        return {
            allowed: false,
            isNoOp: false,
            inventoryAction: "NONE",
            error: "الطلب مكتمل ومنتهي بالفعل ولا يمكن تعديل حالته (Cannot modify a completed order).",
        };
    }

    // 4. Delivered state: Goods are already fulfilled
    if (currentStatus === "DELIVERED") {
        if (targetStatus === "COMPLETED") {
            return {
                allowed: true,
                isNoOp: false,
                inventoryAction: "NONE",
            };
        }
        if (targetStatus === "CANCELLED") {
            return {
                allowed: false,
                isNoOp: false,
                inventoryAction: "NONE",
                error: "لا يمكن إلغاء طلب تم تسليمه للعميل. يجب معالجة المرتجعات المستودعية كإجراء منفصل (Cannot cancel a delivered order).",
            };
        }
        return {
            allowed: false,
            isNoOp: false,
            inventoryAction: "NONE",
            error: `لا يمكن التراجع عن حالة التسليم إلى "${targetStatus}" (Cannot reverse delivered status).`,
        };
    }

    // 5. Shipped state: Out for delivery
    if (currentStatus === "SHIPPED") {
        if (targetStatus === "DELIVERED" || targetStatus === "COMPLETED") {
            // Fulfilling: Stock was reserved at creation; NO extra stock change!
            return {
                allowed: true,
                isNoOp: false,
                inventoryAction: "NONE",
            };
        }
        if (targetStatus === "CANCELLED") {
            // Cancelling shipped order: release reservation if still reserved
            return {
                allowed: true,
                isNoOp: false,
                inventoryAction: stockReserved ? "RELEASE_RESERVATION" : "NONE",
            };
        }
        // Regression backwards to pending/processing/contacted is disallowed
        return {
            allowed: false,
            isNoOp: false,
            inventoryAction: "NONE",
            error: `لا يمكن إرجاع حالة شحنة خرجت للتسليم إلى "${targetStatus}" (Invalid regression from SHIPPED).`,
        };
    }

    // 6. Pre-fulfillment states: PENDING, CONTACTED, PROCESSING
    const preFulfillmentStates: OrderStatusType[] = ["PENDING", "CONTACTED", "PROCESSING"];
    if (preFulfillmentStates.includes(currentStatus)) {
        if (targetStatus === "CANCELLED") {
            // Release active reservation exactly once
            return {
                allowed: true,
                isNoOp: false,
                inventoryAction: stockReserved ? "RELEASE_RESERVATION" : "NONE",
            };
        }

        // Advancing or moving between pre-fulfillment states or delivering
        // Since stock is reserved at submission, moving to DELIVERED or COMPLETED
        // must NOT deduct stock again!
        return {
            allowed: true,
            isNoOp: false,
            inventoryAction: "NONE",
        };
    }

    // Fallback for any unhandled state
    return {
        allowed: false,
        isNoOp: false,
        inventoryAction: "NONE",
        error: `حالة غير مدعومة: ${currentStatus} -> ${targetStatus}`,
    };
}

/**
 * Evaluates inventory action when deleting an order.
 *
 * @param currentStatus - The status of the order being deleted.
 * @param stockReserved - Whether the order currently holds an active stock reservation.
 */
export function evaluateOrderDeletion(
    currentStatus: OrderStatusType,
    stockReserved: boolean
): DeletionEvaluation {
    // If stock is still reserved on an unfulfilled order, deletion releases it
    if (stockReserved && (currentStatus === "PENDING" || currentStatus === "CONTACTED" || currentStatus === "PROCESSING" || currentStatus === "SHIPPED")) {
        return {
            allowed: true,
            inventoryAction: "RELEASE_RESERVATION",
        };
    }

    // If order was delivered or completed, goods were fulfilled; deleting record doesn't restore inventory
    // If order was cancelled, stock was already released
    return {
        allowed: true,
        inventoryAction: "NONE",
    };
}

/**
 * Persists an order status transition inside a database transaction, releasing
 * reserved stock if cancelling, and recording auditable inventory movements.
 */
export async function executeOrderStatusUpdate(
    orderId: string,
    targetStatus: OrderStatusType
): Promise<{ success: boolean; noOp: boolean; error?: string }> {
    const { prisma } = await import("./prisma");

    return await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        if (!order) throw new Error("Order not found");

        const evaluation = evaluateOrderStatusTransition(
            order.status as OrderStatusType,
            targetStatus,
            order.stockReserved
        );

        if (!evaluation.allowed) {
            throw new Error(evaluation.error || "Invalid order status transition");
        }

        if (evaluation.isNoOp) {
            return { success: true, noOp: true };
        }

        if (evaluation.inventoryAction === "RELEASE_RESERVATION") {
            // Atomically claim the active reservation before changing stock.
            // Only one request across all application instances can succeed.
            const claimed = await tx.order.updateMany({
                where: { id: orderId, status: order.status, stockReserved: true, archivedAt: null },
                data: { status: targetStatus, stockReserved: false },
            });
            if (claimed.count !== 1) {
                const latest = await tx.order.findUnique({ where: { id: orderId }, select: { status: true, stockReserved: true } });
                if (latest?.status === targetStatus && !latest.stockReserved) return { success: true, noOp: true };
                throw new Error("Order reservation was already claimed by another request");
            }
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.quantity,
                        },
                    },
                });

                await tx.inventoryMovement.create({
                    data: {
                        orderId: order.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        type: "RELEASE",
                        deduplicationKey: `release:${order.id}:${item.productId}:reservation:v1`,
                        reason: `إلغاء الطلب رقم ${order.id} وإعادة الكمية المحجوزة للمستودع`,
                    },
                });
            }

        } else {
            // Advancing to DELIVERED, COMPLETED, SHIPPED, etc.
            // Stock was reserved at order creation. NO double decrement!
            await tx.order.update({
                where: { id: orderId },
                data: {
                    status: targetStatus,
                    stockReserved: targetStatus === "DELIVERED" || targetStatus === "COMPLETED"
                        ? false
                        : order.stockReserved,
                },
            });
        }

        return { success: true, noOp: false };
    }, {
        maxWait: 20000,
        timeout: 30000,
    });
}

/**
 * Archives a terminal order. Active orders must be cancelled first so any
 * reservation release remains an explicit and independently audited transition.
 */
export async function executeOrderDeletion(
    orderId: string
): Promise<{ success: boolean; released: boolean }> {
    const { prisma } = await import("./prisma");
    return prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({ where: { id: orderId } });
        if (!order) throw new Error("Order not found");
        if (order.archivedAt) return { success: true, released: false };
        if (!["CANCELLED", "DELIVERED", "COMPLETED"].includes(order.status)) {
            throw new Error("Active orders must be cancelled before archiving");
        }
        if (order.stockReserved) throw new Error("Order reservation must be finalized before archiving");
        await tx.order.update({
            where: { id: orderId, archivedAt: null },
            data: { archivedAt: new Date() },
        });
        return { success: true, released: false };
    });
}

// Kept private temporarily for migration review only; no dashboard path invokes
// this historical hard-delete implementation.
async function legacyExecuteOrderHardDeletion(
    orderId: string
): Promise<{ success: boolean; released: boolean }> {
    const { prisma } = await import("./prisma");

    return await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        if (!order) throw new Error("Order not found");

        const evaluation = evaluateOrderDeletion(
            order.status as OrderStatusType,
            order.stockReserved
        );

        let released = false;
        if (evaluation.inventoryAction === "RELEASE_RESERVATION") {
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.quantity,
                        },
                    },
                });

                await tx.inventoryMovement.create({
                    data: {
                        orderId: order.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        type: "RELEASE",
                        reason: `حذف الطلب رقم ${order.id} وإعادة الكمية المحجوزة للمستودع`,
                    },
                });
            }
            released = true;
        }

        await tx.order.delete({
            where: { id: orderId },
        });

        return { success: true, released };
    }, {
        maxWait: 20000,
        timeout: 30000,
    });
}
