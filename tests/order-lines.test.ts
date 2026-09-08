import { describe, it as test } from "vitest";
import assert from "node:assert/strict";
import {
    validateAndAggregateOrderLines,
    computeOrderRequestHash,
} from "../lib/order-lines";

describe("Phase 3.2: Order Line Aggregation and Validation", () => {
    test("merges duplicate product lines and sums their quantities", () => {
        const input = [
            { productId: "prod-1", quantity: 3, options: "flavor A" },
            { productId: "prod-2", quantity: 2 },
            { productId: "prod-1", quantity: 4, options: "flavor B" },
            { productId: "prod-1", quantity: 1, options: "flavor A" },
        ];

        const result = validateAndAggregateOrderLines(input);
        assert.equal(result.isValid, true);
        assert.equal(result.mergedItems.length, 2);

        const prod1 = result.mergedItems.find((i) => i.productId === "prod-1");
        assert.ok(prod1);
        assert.equal(prod1.quantity, 8); // 3 + 4 + 1
        assert.ok(prod1.options?.includes("flavor A"));
        assert.ok(prod1.options?.includes("flavor B"));

        const prod2 = result.mergedItems.find((i) => i.productId === "prod-2");
        assert.ok(prod2);
        assert.equal(prod2.quantity, 2);
    });

    test("rejects zero quantity", () => {
        const input = [{ productId: "prod-1", quantity: 0 }];
        const result = validateAndAggregateOrderLines(input);
        assert.equal(result.isValid, false);
        assert.ok(result.error);
        assert.equal(result.details?.field, "items[0].quantity");
    });

    test("rejects negative quantities", () => {
        const input = [{ productId: "prod-1", quantity: -3 }];
        const result = validateAndAggregateOrderLines(input);
        assert.equal(result.isValid, false);
        assert.ok(result.error);
    });

    test("rejects decimal / floating-point quantities", () => {
        const input = [{ productId: "prod-1", quantity: 2.5 }];
        const result = validateAndAggregateOrderLines(input);
        assert.equal(result.isValid, false);
        assert.ok(result.error);
    });

    test("rejects NaN and non-number quantities", () => {
        const input = [
            { productId: "prod-1", quantity: NaN },
            { productId: "prod-2", quantity: "5" as unknown as number },
        ];
        const result1 = validateAndAggregateOrderLines([input[0]]);
        assert.equal(result1.isValid, false);

        const result2 = validateAndAggregateOrderLines([input[1]]);
        assert.equal(result2.isValid, false);
    });

    test("rejects empty cart", () => {
        const result = validateAndAggregateOrderLines([]);
        assert.equal(result.isValid, false);
        assert.equal(result.details?.field, "items");
    });

    test("rejects non-array input", () => {
        const result = validateAndAggregateOrderLines(null as unknown as unknown[]);
        assert.equal(result.isValid, false);
    });

    test("rejects more than 100 lines", () => {
        const largeInput = Array.from({ length: 101 }, (_, idx) => ({
            productId: `prod-${idx}`,
            quantity: 1,
        }));
        const result = validateAndAggregateOrderLines(largeInput);
        assert.equal(result.isValid, false);
        assert.ok(result.error?.includes("100"));
    });

    test("rejects quantity exceeding maximum allowed per item", () => {
        const input = [{ productId: "prod-1", quantity: 5001 }];
        const result = validateAndAggregateOrderLines(input);
        assert.equal(result.isValid, false);
        assert.ok(result.error?.includes("5,000"));
    });

    test("rejects combined duplicate quantity exceeding maximum limit", () => {
        const input = [
            { productId: "prod-1", quantity: 3000 },
            { productId: "prod-1", quantity: 2500 },
        ];
        const result = validateAndAggregateOrderLines(input);
        assert.equal(result.isValid, false);
        assert.ok(result.error?.includes("5,000"));
    });

    describe("Order request hash stability", () => {
        test("produces same hash regardless of order of items in array", () => {
            const payloadA = {
                shopName: "Al-Baraka Store",
                phone: "0993443901",
                city: "Damascus",
                streetAddress: "Kafar Souseh",
                items: [
                    { productId: "prod-1", quantity: 5, options: null },
                    { productId: "prod-2", quantity: 10, options: "hot" },
                ],
            };

            const payloadB = {
                shopName: "Al-Baraka Store",
                phone: "0993443901",
                city: "Damascus",
                streetAddress: "Kafar Souseh",
                items: [
                    { productId: "prod-2", quantity: 10, options: "hot" },
                    { productId: "prod-1", quantity: 5, options: null },
                ],
            };

            const hashA = computeOrderRequestHash(payloadA);
            const hashB = computeOrderRequestHash(payloadB);
            assert.equal(hashA, hashB);
        });

        test("produces different hash if quantity or item differs", () => {
            const base = {
                shopName: "Al-Baraka Store",
                phone: "0993443901",
                city: "Damascus",
                streetAddress: "Kafar Souseh",
                items: [{ productId: "prod-1", quantity: 5, options: null }],
            };

            const different = {
                ...base,
                items: [{ productId: "prod-1", quantity: 6, options: null }],
            };

            assert.notEqual(computeOrderRequestHash(base), computeOrderRequestHash(different));
        });
    });
});
