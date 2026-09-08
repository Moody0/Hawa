import crypto from "crypto";
import { sanitizeString } from "./order-validation";

export interface RawOrderItemInput {
    productId?: unknown;
    quantity?: unknown;
    options?: unknown;
    price?: unknown;
}

export interface AggregatedOrderItem {
    productId: string;
    quantity: number;
    options: string | null;
}

export interface LineValidationResult {
    isValid: boolean;
    error?: string;
    details?: {
        field: string;
        message: string;
    };
    mergedItems: AggregatedOrderItem[];
}

export const MAX_ORDER_LINES = 100;
export const MAX_QUANTITY_PER_LINE = 5000;

/**
 * Validates carton quantities and merges duplicate productId lines.
 *
 * Implements Phase 3.2:
 * - Merge duplicate productId lines before stock validation.
 * - Require positive integer carton quantities.
 * - Apply documented maximum quantities and request-line limits.
 * - Return structured 400/422 errors without leaking internal details.
 */
export function validateAndAggregateOrderLines(
    rawItems: unknown
): LineValidationResult {
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
        return {
            isValid: false,
            error: "سلة المشتريات فارغة، يرجى إضافة منتجات للمتابعة (Cart is empty)",
            details: { field: "items", message: "Cart cannot be empty" },
            mergedItems: [],
        };
    }

    if (rawItems.length > MAX_ORDER_LINES) {
        return {
            isValid: false,
            error: `تجاوزت الحد الأقصى المسموح به لعدد العناصر في الطلبية الواحدة (${MAX_ORDER_LINES} عنصر)`,
            details: {
                field: "items",
                message: `Order lines exceed maximum limit of ${MAX_ORDER_LINES}`,
            },
            mergedItems: [],
        };
    }

    const mergedMap = new Map<
        string,
        {
            productId: string;
            quantity: number;
            optionsSet: Set<string>;
        }
    >();

    for (let i = 0; i < rawItems.length; i++) {
        const item = rawItems[i] as RawOrderItemInput;

        if (!item || typeof item !== "object") {
            return {
                isValid: false,
                error: `بيانات العنصر رقم ${i + 1} في الطلبية غير صالحة`,
                details: { field: `items[${i}]`, message: "Item is not an object" },
                mergedItems: [],
            };
        }

        const rawProductId = item.productId;
        if (typeof rawProductId !== "string" || !rawProductId.trim()) {
            return {
                isValid: false,
                error: `معرف المنتج في العنصر رقم ${i + 1} غير صالح`,
                details: { field: `items[${i}].productId`, message: "Invalid product ID" },
                mergedItems: [],
            };
        }
        const cleanProductId = rawProductId.trim();

        const rawQty = item.quantity;
        // Require positive integer carton quantities
        if (
            typeof rawQty !== "number" ||
            !Number.isFinite(rawQty) ||
            !Number.isInteger(rawQty) ||
            rawQty <= 0
        ) {
            return {
                isValid: false,
                error: "الكمية المطلوبة لكل منتج يجب أن تكون رقماً صحيحاً وموجباً (عدد الطرود/الكراتين)",
                details: {
                    field: `items[${i}].quantity`,
                    message: "Quantity must be a positive integer",
                },
                mergedItems: [],
            };
        }

        if (rawQty > MAX_QUANTITY_PER_LINE) {
            return {
                isValid: false,
                error: `الكمية المطلوبة للمنتج الواحد لا يمكن أن تتجاوز ${MAX_QUANTITY_PER_LINE.toLocaleString()} طرد`,
                details: {
                    field: `items[${i}].quantity`,
                    message: `Quantity exceeds maximum limit of ${MAX_QUANTITY_PER_LINE}`,
                },
                mergedItems: [],
            };
        }

        const rawOption = typeof item.options === "string" ? sanitizeString(item.options, 100) : "";

        // Merge duplicate productId lines before stock validation
        const existing = mergedMap.get(cleanProductId);
        if (existing) {
            const combinedQty = existing.quantity + rawQty;
            if (combinedQty > MAX_QUANTITY_PER_LINE) {
                return {
                    isValid: false,
                    error: `إجمالي الكمية المطلوبة لنفس المنتج لا يمكن أن يتجاوز ${MAX_QUANTITY_PER_LINE.toLocaleString()} طرد`,
                    details: {
                        field: `items[${i}].quantity`,
                        message: `Total merged quantity for product exceeds ${MAX_QUANTITY_PER_LINE}`,
                    },
                    mergedItems: [],
                };
            }
            existing.quantity = combinedQty;
            if (rawOption) {
                existing.optionsSet.add(rawOption);
            }
        } else {
            const optionsSet = new Set<string>();
            if (rawOption) {
                optionsSet.add(rawOption);
            }
            mergedMap.set(cleanProductId, {
                productId: cleanProductId,
                quantity: rawQty,
                optionsSet,
            });
        }
    }

    const mergedItems: AggregatedOrderItem[] = Array.from(mergedMap.values()).map(
        (entry) => ({
            productId: entry.productId,
            quantity: entry.quantity,
            options: entry.optionsSet.size > 0 ? Array.from(entry.optionsSet).join(", ") : null,
        })
    );

    return {
        isValid: true,
        mergedItems,
    };
}

/**
 * Computes a deterministic SHA-256 hash of an order payload to detect
 * idempotency key reuse with differing payloads.
 */
export function computeOrderRequestHash(payload: {
    shopName: string;
    phone: string;
    city: string;
    streetAddress: string;
    items: AggregatedOrderItem[];
}): string {
    const sortedItems = [...payload.items]
        .sort((a, b) => a.productId.localeCompare(b.productId))
        .map((i) => `${i.productId}:${i.quantity}:${i.options || ""}`)
        .join("|");

    const raw = [
        payload.phone.trim(),
        payload.shopName.trim().toLowerCase(),
        payload.city.trim().toLowerCase(),
        payload.streetAddress.trim().toLowerCase(),
        sortedItems,
    ].join("###");

    return crypto.createHash("sha256").update(raw, "utf8").digest("hex");
}
