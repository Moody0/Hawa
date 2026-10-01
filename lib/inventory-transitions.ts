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