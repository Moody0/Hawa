(process.env as any).NODE_ENV = "test";
import test, { describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";
import { POST } from "../app/api/orders/route";
import {
    executeOrderStatusUpdate,
    executeOrderDeletion,
} from "../lib/inventory-transitions";

describe("Phase 3.6: Concurrency, Atomic Reservation & Inventory Tests", { timeout: 180000 }, () => {
    let testCategoryId: string;
    let testBrandId: string;
    const createdProductIds: string[] = [];
    const createdOrderIds: string[] = [];

    async function cleanupTestData() {
        const danglingProducts = await prisma.product.findMany({
            where: {
                OR: [
                    { id: { in: createdProductIds } },
                    { slug: { startsWith: "test-prod-" } },
                    { nameAr: { startsWith: "منتج تجريبي test-" } },
                ],
            },
            select: { id: true },
        });
        const productIds = danglingProducts.map((p) => p.id);

        const danglingOrders = await prisma.order.findMany({
            where: {
                OR: [
                    { id: { in: createdOrderIds } },
                    { idempotencyKey: { startsWith: "race_key_" } },
                    { idempotencyKey: { startsWith: "dup_line_" } },
                    { idempotencyKey: { startsWith: "double_click_" } },
                    { idempotencyKey: { startsWith: "deliv_test_" } },
                    { idempotencyKey: { startsWith: "cancel_test_" } },
                    { idempotencyKey: { startsWith: "repeat_test_" } },
                ],
            },
            select: { id: true },
        });
        const orderIds = danglingOrders.map((o) => o.id);

        if (orderIds.length > 0 || productIds.length > 0) {
            await prisma.inventoryMovement.deleteMany({
                where: {
                    OR: [
                        ...(orderIds.length > 0 ? [{ orderId: { in: orderIds } }] : []),
                        ...(productIds.length > 0 ? [{ productId: { in: productIds } }] : []),
                    ],
                },
            });
            await prisma.orderItem.deleteMany({
                where: {
                    OR: [
                        ...(orderIds.length > 0 ? [{ orderId: { in: orderIds } }] : []),
                        ...(productIds.length > 0 ? [{ productId: { in: productIds } }] : []),
                    ],
                },
            });
            if (orderIds.length > 0) {
                await prisma.order.deleteMany({
                    where: { id: { in: orderIds } },
                });
            }
            if (productIds.length > 0) {
                await prisma.product.deleteMany({
                    where: { id: { in: productIds } },
                });
            }
        }
    }

    before(async () => {
        await cleanupTestData();
        const cat = await prisma.category.findFirst({
            select: { id: true, brandId: true },
        });
        if (!cat) {
            throw new Error("No category found for testing");
        }
        testCategoryId = cat.id;
        testBrandId = cat.brandId;
    });

    after(async () => {
        await cleanupTestData();
        await prisma.$disconnect();
    });

    async function createTestProduct(initialStock: number, namePrefix = "Test Product") {
        const unique = `test-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const product = await prisma.product.create({
            data: {
                name: `${namePrefix} ${unique}`,
                nameAr: `منتج تجريبي ${unique}`,
                slug: `test-prod-${unique}`,
                images: "/placeholder.svg",
                price: 100,
                stock: initialStock,
                minOrder: 1,
                categoryId: testCategoryId,
                brandId: testBrandId,
            },
        });
        createdProductIds.push(product.id);
        return product;
    }

    test("1. Twenty concurrent requests for the final unit: exactly one succeeds", async () => {
        const product = await createTestProduct(1, "Final Unit Race");
        const concurrentCount = 20;

        const requests = Array.from({ length: concurrentCount }, (_, idx) => {
            const idempotencyKey = `race_key_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`;
            const payload = {
                idempotencyKey,
                shopName: `Test Shop ${idx}`,
                ownerName: `Test Owner ${idx}`,
                phone: "0993443901",
                city: "Homs",
                streetAddress: "Kafar Souseh St 12",
                items: [{ productId: product.id, quantity: 1 }],
            };

            const req = new Request("http://localhost:3000/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Idempotency-Key": idempotencyKey,
                },
                body: JSON.stringify(payload),
            });

            return POST(req);
        });

        const responses = await Promise.all(requests);
        const results = await Promise.all(
            responses.map(async (res) => {
                const data = await res.json();
                return { status: res.status, data };
            })
        );

        const successes = results.filter((r) => r.status === 201);
        const failures = results.filter((r) => r.status === 422 || r.status === 400);

        assert.equal(
            successes.length,
            1,
            `Expected exactly 1 success out of 20 concurrent requests, got ${successes.length}`
        );
        assert.equal(
            failures.length,
            19,
            `Expected exactly 19 failures, got ${failures.length}`
        );

        createdOrderIds.push(successes[0].data.id);

        // Verify stock in database is exactly 0 and NEVER negative
        const refreshedProduct = await prisma.product.findUnique({
            where: { id: product.id },
            select: { stock: true },
        });
        assert.equal(refreshedProduct?.stock, 0);
    });

    test("2. Duplicate product lines cannot exceed stock jointly", async () => {
        const product = await createTestProduct(5, "Joint Duplicate Lines");
        const idempotencyKey = `dup_line_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const payload = {
            idempotencyKey,
            shopName: "Duplicate Test Store",
            ownerName: "Merchant Samer",
            phone: "0993443901",
            city: "Damascus",
            streetAddress: "Al-Shaalan",
            items: [
                { productId: product.id, quantity: 3 },
                { productId: product.id, quantity: 3 }, // Total 6 > 5
            ],
        };

        const req = new Request("http://localhost:3000/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Idempotency-Key": idempotencyKey,
            },
            body: JSON.stringify(payload),
        });

        const res = await POST(req);
        assert.equal(res.status, 422);
        const data = await res.json();
        assert.ok(data.message?.includes("غير متوفرة حالياً"));

        // Product stock must remain unchanged at 5
        const refreshedProduct = await prisma.product.findUnique({
            where: { id: product.id },
            select: { stock: true },
        });
        assert.equal(refreshedProduct?.stock, 5);
    });

    test("3. Double-click/retry with one key creates one order", async () => {
        const product = await createTestProduct(10, "Idempotent Retry");
        const sharedIdempotencyKey = `double_click_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const payload = {
            idempotencyKey: sharedIdempotencyKey,
            shopName: "Retry Store",
            ownerName: "Merchant Nader",
            phone: "0993443901",
            city: "Aleppo",
            streetAddress: "Al-Midan",
            items: [{ productId: product.id, quantity: 2 }],
        };

        const createReq = () =>
            new Request("http://localhost:3000/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Idempotency-Key": sharedIdempotencyKey,
                },
                body: JSON.stringify(payload),
            });

        // Request 1: Initial submission
        const res1 = await POST(createReq());
        assert.equal(res1.status, 201);
        const order1 = await res1.json();
        createdOrderIds.push(order1.id);

        // Request 2: Immediate retry with same key and payload
        const res2 = await POST(createReq());
        assert.equal(res2.status, 200);
        const order2 = await res2.json();

        assert.equal(order1.id, order2.id);
        assert.equal(order2.isReplay, true);

        // Verify only 1 order row exists in database
        const orderCount = await prisma.order.count({
            where: { idempotencyKey: sharedIdempotencyKey },
        });
        assert.equal(orderCount, 1);

        // Verify stock was decremented ONLY ONCE (10 - 2 = 8)
        const refreshedProduct = await prisma.product.findUnique({
            where: { id: product.id },
            select: { stock: true },
        });
        assert.equal(refreshedProduct?.stock, 8);
    });

    test("4. Pending -> delivered changes stock once total", async () => {
        const product = await createTestProduct(10, "Delivery Dedup");
        const idempotencyKey = `deliv_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const req = new Request("http://localhost:3000/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Idempotency-Key": idempotencyKey,
            },
            body: JSON.stringify({
                idempotencyKey,
                shopName: "Delivery Test Store",
                ownerName: "Tariq",
                phone: "0993443901",
                city: "Latakia",
                streetAddress: "Corniche",
                items: [{ productId: product.id, quantity: 2 }],
            }),
        });

        const res = await POST(req);
        assert.equal(res.status, 201);
        const order = await res.json();
        createdOrderIds.push(order.id);

        // Check stock after reservation
        let currentProduct = await prisma.product.findUnique({
            where: { id: product.id },
            select: { stock: true },
        });
        assert.equal(currentProduct?.stock, 8); // 10 - 2

        // Transition from PENDING to DELIVERED
        const updateResult = await executeOrderStatusUpdate(order.id, "DELIVERED");
        assert.equal(updateResult.success, true);
        assert.equal(updateResult.noOp, false);

        // Stock MUST REMAIN 8 (NO second decrement on delivery!)
        currentProduct = await prisma.product.findUnique({
            where: { id: product.id },
            select: { stock: true },
        });
        assert.equal(currentProduct?.stock, 8);
    });

    test("5. Pending -> cancelled restores stock once", async () => {
        const product = await createTestProduct(10, "Cancel Release");
        const idempotencyKey = `cancel_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const req = new Request("http://localhost:3000/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Idempotency-Key": idempotencyKey,
            },
            body: JSON.stringify({
                idempotencyKey,
                shopName: "Cancellation Store",
                ownerName: "Zaid",
                phone: "0993443901",
                city: "Tartus",
                streetAddress: "Main St",
                items: [{ productId: product.id, quantity: 3 }],
            }),
        });

        const res = await POST(req);
        assert.equal(res.status, 201);
        const order = await res.json();
        createdOrderIds.push(order.id);

        // Stock reserved: 10 - 3 = 7
        let currentProduct = await prisma.product.findUnique({
            where: { id: product.id },
            select: { stock: true },
        });
        assert.equal(currentProduct?.stock, 7);

        // Cancel order: releases active reservation back to inventory
        const cancelResult = await executeOrderStatusUpdate(order.id, "CANCELLED");
        assert.equal(cancelResult.success, true);

        // Stock must be restored back to 10
        currentProduct = await prisma.product.findUnique({
            where: { id: product.id },
            select: { stock: true },
        });
        assert.equal(currentProduct?.stock, 10);

        // Check order stockReserved flag
        const dbOrder = await prisma.order.findUnique({
            where: { id: order.id },
            select: { stockReserved: true, status: true },
        });
        assert.equal(dbOrder?.status, "CANCELLED");
        assert.equal(dbOrder?.stockReserved, false);

        // Check auditable inventory movement record
        const releaseMovements = await prisma.inventoryMovement.findMany({
            where: { orderId: order.id, type: "RELEASE" },
        });
        assert.equal(releaseMovements.length, 1);
        assert.equal(releaseMovements[0].quantity, 3);
    });

    test("6. Repeated transition does not change stock again", async () => {
        const product = await createTestProduct(10, "Repeated Transition");
        const idempotencyKey = `repeat_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const req = new Request("http://localhost:3000/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Idempotency-Key": idempotencyKey,
            },
            body: JSON.stringify({
                idempotencyKey,
                shopName: "Repeat Store",
                ownerName: "Sami",
                phone: "0993443901",
                city: "Hama",
                streetAddress: "Al-Hadher",
                items: [{ productId: product.id, quantity: 4 }],
            }),
        });

        const res = await POST(req);
        assert.equal(res.status, 201);
        const order = await res.json();
        createdOrderIds.push(order.id);

        // Cancel order once -> stock restored to 10
        await executeOrderStatusUpdate(order.id, "CANCELLED");
        let currentProduct = await prisma.product.findUnique({
            where: { id: product.id },
            select: { stock: true },
        });
        assert.equal(currentProduct?.stock, 10);

        // Cancel order a SECOND time -> no-op
        const repeatResult = await executeOrderStatusUpdate(order.id, "CANCELLED");
        assert.equal(repeatResult.success, true);
        assert.equal(repeatResult.noOp, true);

        // Stock MUST STILL BE 10 (never restored twice!)
        currentProduct = await prisma.product.findUnique({
            where: { id: product.id },
            select: { stock: true },
        });
        assert.equal(currentProduct?.stock, 10);

        // Deleting order should also not restore stock again since stockReserved is false
        const deleteResult = await executeOrderDeletion(order.id);
        assert.equal(deleteResult.success, true);
        assert.equal(deleteResult.released, false);

        currentProduct = await prisma.product.findUnique({
            where: { id: product.id },
            select: { stock: true },
        });
        assert.equal(currentProduct?.stock, 10);
    });
});
