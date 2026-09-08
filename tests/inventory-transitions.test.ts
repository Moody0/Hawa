import { describe, it as test } from "vitest";
import assert from "node:assert/strict";
import {
    evaluateOrderStatusTransition,
    evaluateOrderDeletion,
    OrderStatusType,
} from "../lib/inventory-transitions";

describe("Phase 3.1: Inventory Transition Contract Unit Tests", () => {
    describe("1. Delivery causes no additional stock change", () => {
        const preDeliveryStates: OrderStatusType[] = ["PENDING", "CONTACTED", "PROCESSING", "SHIPPED"];

        preDeliveryStates.forEach((status) => {
            test(`${status} -> DELIVERED is allowed with ZERO additional stock deduction`, () => {
                const result = evaluateOrderStatusTransition(status, "DELIVERED", true);
                assert.equal(result.allowed, true);
                assert.equal(result.isNoOp, false);
                assert.equal(result.inventoryAction, "NONE");
            });

            test(`${status} -> COMPLETED is allowed with ZERO additional stock deduction`, () => {
                const result = evaluateOrderStatusTransition(status, "COMPLETED", true);
                assert.equal(result.allowed, true);
                assert.equal(result.inventoryAction, "NONE");
            });
        });

        test("DELIVERED -> COMPLETED causes no additional stock change", () => {
            const result = evaluateOrderStatusTransition("DELIVERED", "COMPLETED", true);
            assert.equal(result.allowed, true);
            assert.equal(result.inventoryAction, "NONE");
        });
    });

    describe("2. Cancellation releases an active reservation exactly once", () => {
        test("PENDING -> CANCELLED with active reservation releases stock", () => {
            const result = evaluateOrderStatusTransition("PENDING", "CANCELLED", true);
            assert.equal(result.allowed, true);
            assert.equal(result.inventoryAction, "RELEASE_RESERVATION");
        });

        test("PROCESSING -> CANCELLED with active reservation releases stock", () => {
            const result = evaluateOrderStatusTransition("PROCESSING", "CANCELLED", true);
            assert.equal(result.allowed, true);
            assert.equal(result.inventoryAction, "RELEASE_RESERVATION");
        });

        test("SHIPPED -> CANCELLED with active reservation releases stock", () => {
            const result = evaluateOrderStatusTransition("SHIPPED", "CANCELLED", true);
            assert.equal(result.allowed, true);
            assert.equal(result.inventoryAction, "RELEASE_RESERVATION");
        });

        test("Cancellation when reservation was already released does NOT release stock again", () => {
            const result = evaluateOrderStatusTransition("PENDING", "CANCELLED", false);
            assert.equal(result.allowed, true);
            assert.equal(result.inventoryAction, "NONE");
        });
    });

    describe("3. Idempotent repeated transitions (no-ops)", () => {
        const allStatuses: OrderStatusType[] = [
            "PENDING",
            "CONTACTED",
            "PROCESSING",
            "SHIPPED",
            "DELIVERED",
            "COMPLETED",
            "CANCELLED",
        ];

        allStatuses.forEach((status) => {
            test(`Repeating ${status} -> ${status} is a no-op with no inventory change`, () => {
                const result = evaluateOrderStatusTransition(status, status, true);
                assert.equal(result.allowed, true);
                assert.equal(result.isNoOp, true);
                assert.equal(result.inventoryAction, "NONE");
            });
        });
    });

    describe("4. Invalid reverse transitions are explicitly rejected", () => {
        test("CANCELLED cannot transition to any active or completed state", () => {
            const targets: OrderStatusType[] = ["PENDING", "CONTACTED", "PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED"];
            targets.forEach((target) => {
                const result = evaluateOrderStatusTransition("CANCELLED", target, false);
                assert.equal(result.allowed, false);
                assert.equal(result.inventoryAction, "NONE");
                assert.ok(result.error);
            });
        });

        test("COMPLETED cannot transition to any other state", () => {
            const targets: OrderStatusType[] = ["PENDING", "PROCESSING", "DELIVERED", "CANCELLED"];
            targets.forEach((target) => {
                const result = evaluateOrderStatusTransition("COMPLETED", target, true);
                assert.equal(result.allowed, false);
                assert.equal(result.inventoryAction, "NONE");
                assert.ok(result.error);
            });
        });

        test("DELIVERED cannot reverse to CANCELLED or pre-delivery states", () => {
            const invalidTargets: OrderStatusType[] = ["CANCELLED", "PENDING", "CONTACTED", "PROCESSING", "SHIPPED"];
            invalidTargets.forEach((target) => {
                const result = evaluateOrderStatusTransition("DELIVERED", target, true);
                assert.equal(result.allowed, false);
                assert.equal(result.inventoryAction, "NONE");
                assert.ok(result.error);
            });
        });

        test("SHIPPED cannot regress to PENDING, CONTACTED, or PROCESSING", () => {
            const invalidTargets: OrderStatusType[] = ["PENDING", "CONTACTED", "PROCESSING"];
            invalidTargets.forEach((target) => {
                const result = evaluateOrderStatusTransition("SHIPPED", target, true);
                assert.equal(result.allowed, false);
                assert.equal(result.inventoryAction, "NONE");
                assert.ok(result.error);
            });
        });
    });

    describe("5. Order deletion inventory rules", () => {
        test("Deleting an unfulfilled order with active reservation releases stock", () => {
            const unfulfilled: OrderStatusType[] = ["PENDING", "CONTACTED", "PROCESSING", "SHIPPED"];
            unfulfilled.forEach((status) => {
                const result = evaluateOrderDeletion(status, true);
                assert.equal(result.allowed, true);
                assert.equal(result.inventoryAction, "RELEASE_RESERVATION");
            });
        });

        test("Deleting an order whose reservation was already released does not release stock again", () => {
            const result = evaluateOrderDeletion("PENDING", false);
            assert.equal(result.allowed, true);
            assert.equal(result.inventoryAction, "NONE");
        });

        test("Deleting a CANCELLED order does not release stock again", () => {
            const result = evaluateOrderDeletion("CANCELLED", false);
            assert.equal(result.allowed, true);
            assert.equal(result.inventoryAction, "NONE");
        });

        test("Deleting a DELIVERED or COMPLETED order does not release stock into inventory", () => {
            const fulfilled: OrderStatusType[] = ["DELIVERED", "COMPLETED"];
            fulfilled.forEach((status) => {
                const result = evaluateOrderDeletion(status, true);
                assert.equal(result.allowed, true);
                assert.equal(result.inventoryAction, "NONE");
            });
        });
    });
});
