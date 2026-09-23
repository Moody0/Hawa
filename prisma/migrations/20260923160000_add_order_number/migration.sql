ALTER TABLE "Order" ADD COLUMN "orderNumber" SERIAL NOT NULL;

WITH ranked_orders AS (
    SELECT
        "id",
        ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC)::INTEGER AS order_number
    FROM "Order"
)
UPDATE "Order" AS existing_orders
SET "orderNumber" = ranked_orders.order_number
FROM ranked_orders
WHERE existing_orders."id" = ranked_orders."id";

SELECT setval(
    pg_get_serial_sequence('"Order"', 'orderNumber'),
    COALESCE((SELECT MAX("orderNumber") FROM "Order"), 0) + 1,
    false
);

CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
