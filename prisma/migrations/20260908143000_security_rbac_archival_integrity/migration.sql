-- Security, RBAC, archival, login-throttling, and inventory-integrity foundation.
-- The migration is additive and preserves the legacy boolean permission columns
-- during the transition to normalized permissions.

CREATE TYPE "AdminPermission" AS ENUM (
  'PRODUCTS_VIEW', 'PRODUCTS_MANAGE', 'PRODUCTS_ARCHIVE', 'PRODUCTS_IMPORT',
  'BRANDS_VIEW', 'BRANDS_MANAGE', 'BRANDS_ARCHIVE',
  'CATEGORIES_VIEW', 'CATEGORIES_MANAGE', 'CATEGORIES_ARCHIVE',
  'MAIN_CATEGORIES_VIEW', 'MAIN_CATEGORIES_MANAGE', 'MAIN_CATEGORIES_ARCHIVE',
  'BANNERS_VIEW', 'BANNERS_MANAGE', 'BANNERS_ARCHIVE',
  'ORDERS_VIEW', 'ORDERS_MANAGE', 'ORDERS_ARCHIVE',
  'CUSTOMERS_VIEW', 'CUSTOMERS_MANAGE', 'CUSTOMERS_ARCHIVE',
  'REVIEWS_VIEW', 'REVIEWS_MANAGE', 'REVIEWS_ARCHIVE',
  'BLOG_VIEW', 'BLOG_MANAGE', 'BLOG_ARCHIVE',
  'SITE_CONTENT_VIEW', 'SITE_CONTENT_MANAGE', 'SITE_CONTENT_ARCHIVE',
  'AUDIT_LOG_VIEW'
);

ALTER TABLE "User" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "disabledAt" TIMESTAMP(3);
ALTER TABLE "MainCategory" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "Category" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "Brand" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "Banner" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "PromoCode" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "Review" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "Customer" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "Post" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "InventoryMovement" ADD COLUMN "deduplicationKey" TEXT;

CREATE TABLE "UserPermission" (
  "userId" TEXT NOT NULL,
  "permission" "AdminPermission" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("userId", "permission")
);

CREATE TABLE "AdminAuditLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdminLoginAttempt" (
  "id" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "successful" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminLoginAttempt_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "User_archivedAt_idx" ON "User"("archivedAt");
CREATE INDEX "User_disabledAt_idx" ON "User"("disabledAt");
CREATE INDEX "MainCategory_archivedAt_idx" ON "MainCategory"("archivedAt");
CREATE INDEX "Category_archivedAt_idx" ON "Category"("archivedAt");
CREATE INDEX "Product_archivedAt_idx" ON "Product"("archivedAt");
CREATE INDEX "Brand_archivedAt_idx" ON "Brand"("archivedAt");
CREATE INDEX "Order_archivedAt_idx" ON "Order"("archivedAt");
CREATE INDEX "Banner_archivedAt_idx" ON "Banner"("archivedAt");
CREATE INDEX "PromoCode_archivedAt_idx" ON "PromoCode"("archivedAt");
CREATE INDEX "Review_archivedAt_idx" ON "Review"("archivedAt");
CREATE INDEX "Customer_archivedAt_idx" ON "Customer"("archivedAt");
CREATE INDEX "Post_archivedAt_idx" ON "Post"("archivedAt");
CREATE INDEX "UserPermission_permission_idx" ON "UserPermission"("permission");
CREATE INDEX "AdminAuditLog_actorId_createdAt_idx" ON "AdminAuditLog"("actorId", "createdAt");
CREATE INDEX "AdminAuditLog_entityType_entityId_createdAt_idx" ON "AdminAuditLog"("entityType", "entityId", "createdAt");
CREATE INDEX "AdminAuditLog_action_createdAt_idx" ON "AdminAuditLog"("action", "createdAt");
CREATE INDEX "AdminLoginAttempt_keyHash_scope_createdAt_idx" ON "AdminLoginAttempt"("keyHash", "scope", "createdAt");
CREATE INDEX "AdminLoginAttempt_createdAt_idx" ON "AdminLoginAttempt"("createdAt");
CREATE UNIQUE INDEX "InventoryMovement_deduplicationKey_key" ON "InventoryMovement"("deduplicationKey");

-- Existing fulfilled/cancelled orders must not retain an active reservation.
UPDATE "Order"
SET "stockReserved" = CASE
  WHEN "status" IN ('DELIVERED', 'COMPLETED', 'CANCELLED') THEN false
  ELSE true
END;

-- Existing resource permissions are migrated conservatively. Managing implies
-- view; deleting maps to the reversible archive permission.
INSERT INTO "UserPermission" ("userId", "permission")
SELECT "id", permission
FROM "User"
CROSS JOIN LATERAL unnest(ARRAY[
  CASE WHEN "canManageProducts" THEN 'PRODUCTS_VIEW'::"AdminPermission" END,
  CASE WHEN "canManageProducts" THEN 'PRODUCTS_MANAGE'::"AdminPermission" END,
  CASE WHEN "canDeleteProducts" THEN 'PRODUCTS_ARCHIVE'::"AdminPermission" END,
  CASE WHEN "canManageBrands" THEN 'BRANDS_VIEW'::"AdminPermission" END,
  CASE WHEN "canManageBrands" THEN 'BRANDS_MANAGE'::"AdminPermission" END,
  CASE WHEN "canDeleteBrands" THEN 'BRANDS_ARCHIVE'::"AdminPermission" END,
  CASE WHEN "canManageCategories" THEN 'CATEGORIES_VIEW'::"AdminPermission" END,
  CASE WHEN "canManageCategories" THEN 'CATEGORIES_MANAGE'::"AdminPermission" END,
  CASE WHEN "canDeleteCategories" THEN 'CATEGORIES_ARCHIVE'::"AdminPermission" END,
  CASE WHEN "canManageBanners" THEN 'BANNERS_VIEW'::"AdminPermission" END,
  CASE WHEN "canManageBanners" THEN 'BANNERS_MANAGE'::"AdminPermission" END,
  CASE WHEN "canDeleteBanners" THEN 'BANNERS_ARCHIVE'::"AdminPermission" END,
  CASE WHEN "canManageOrders" THEN 'ORDERS_VIEW'::"AdminPermission" END,
  CASE WHEN "canManageOrders" THEN 'ORDERS_MANAGE'::"AdminPermission" END,
  CASE WHEN "canDeleteOrders" THEN 'ORDERS_ARCHIVE'::"AdminPermission" END,
  CASE WHEN "canManageOrders" THEN 'CUSTOMERS_VIEW'::"AdminPermission" END,
  CASE WHEN "canManageOrders" THEN 'CUSTOMERS_MANAGE'::"AdminPermission" END,
  CASE WHEN "canDeleteOrders" THEN 'CUSTOMERS_ARCHIVE'::"AdminPermission" END,
  CASE WHEN "canManageReviews" THEN 'REVIEWS_VIEW'::"AdminPermission" END,
  CASE WHEN "canManageReviews" THEN 'REVIEWS_MANAGE'::"AdminPermission" END,
  CASE WHEN "canManageReviews" THEN 'REVIEWS_ARCHIVE'::"AdminPermission" END
]) AS permission
WHERE permission IS NOT NULL
ON CONFLICT DO NOTHING;

-- Super administrators receive every permission explicitly; authorization still
-- treats the role itself as authoritative.
INSERT INTO "UserPermission" ("userId", "permission")
SELECT u."id", p.permission
FROM "User" u
CROSS JOIN unnest(enum_range(NULL::"AdminPermission")) AS p(permission)
WHERE u."role" = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;

-- Remove stored raw HTML from existing blog bodies. Markdown formatting remains;
-- future writes are validated by the application before persistence.
UPDATE "Post" SET "content" = regexp_replace("content", '<[^>]*>', '', 'g')
WHERE "content" ~ '<[^>]*>';
UPDATE "Post" SET "contentAr" = regexp_replace("contentAr", '<[^>]*>', '', 'g')
WHERE "contentAr" IS NOT NULL AND "contentAr" ~ '<[^>]*>';
