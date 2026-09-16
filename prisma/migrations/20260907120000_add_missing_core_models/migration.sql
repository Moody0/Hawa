-- Enum updates
DO $$ BEGIN
    ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'CONTACTED';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop legacy Cart and CartItem tables
DROP TABLE IF EXISTS "CartItem" CASCADE;
DROP TABLE IF EXISTS "Cart" CASCADE;

-- 1. MainCategory Table
CREATE TABLE IF NOT EXISTS "MainCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "showInNav" BOOLEAN NOT NULL DEFAULT true,
    "navOrder" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MainCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MainCategory_name_key" ON "MainCategory"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "MainCategory_slug_key" ON "MainCategory"("slug");
CREATE INDEX IF NOT EXISTS "MainCategory_isActive_showInNav_navOrder_idx" ON "MainCategory"("isActive", "showInNav", "navOrder");
CREATE INDEX IF NOT EXISTS "MainCategory_isFeatured_idx" ON "MainCategory"("isFeatured");

-- 2. Banner Table
CREATE TABLE IF NOT EXISTS "Banner" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "titleAr" TEXT,
    "subtitleAr" TEXT,
    "image" TEXT NOT NULL,
    "buttonText" TEXT DEFAULT 'Shop Now',
    "buttonTextAr" TEXT DEFAULT 'تسوق الآن',
    "link" TEXT DEFAULT '/products',
    "badge" TEXT DEFAULT 'Certified Wholesale',
    "badgeAr" TEXT DEFAULT 'توزيع جملة معتمد',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Banner_isActive_createdAt_idx" ON "Banner"("isActive", "createdAt");

-- 3. PromoCode Table
CREATE TABLE IF NOT EXISTS "PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountPercentage" INTEGER NOT NULL,
    "delegateName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "totalSales" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PromoCode_code_key" ON "PromoCode"("code");

-- 4. Customer Table
CREATE TABLE IF NOT EXISTS "Customer" (
    "id" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Customer_phone_key" ON "Customer"("phone");
CREATE INDEX IF NOT EXISTS "Customer_phone_idx" ON "Customer"("phone");

-- 5. User Columns & Cleanup
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "username" TEXT,
ADD COLUMN IF NOT EXISTS "canDeleteBanners" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "canDeleteCategories" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "canDeleteOrders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "canDeleteProducts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "canDeletePromoCodes" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "canManageBanners" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "canManageCategories" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "canManageOrders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "canManageProducts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "canManagePromoCodes" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "canManageReviews" BOOLEAN NOT NULL DEFAULT true;

UPDATE "User" SET "username" = COALESCE("username", "name", "email", 'admin-' || "id") WHERE "username" IS NULL;
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");

-- Drop legacy User columns if they exist
ALTER TABLE "User" DROP COLUMN IF EXISTS "email";
ALTER TABLE "User" DROP COLUMN IF EXISTS "name";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'ADMIN';

-- 6. Category Columns & Indexes
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "mainCategoryId" TEXT;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "Category_mainCategoryId_idx" ON "Category"("mainCategoryId");
CREATE INDEX IF NOT EXISTS "Category_isFeatured_idx" ON "Category"("isFeatured");
CREATE INDEX IF NOT EXISTS "Category_isFeatured_updatedAt_idx" ON "Category"("isFeatured", "updatedAt");

-- 7. Brand Columns & Indexes
ALTER TABLE "Brand" ADD COLUMN IF NOT EXISTS "mainCategoryId" TEXT;
CREATE INDEX IF NOT EXISTS "Brand_mainCategoryId_idx" ON "Brand"("mainCategoryId");

-- 8. Product Columns & Indexes
ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "nameAr" TEXT,
ADD COLUMN IF NOT EXISTS "nameEn" TEXT,
ADD COLUMN IF NOT EXISTS "descriptionAr" TEXT,
ADD COLUMN IF NOT EXISTS "descriptionEn" TEXT,
ADD COLUMN IF NOT EXISTS "discountPrice" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "discountType" TEXT,
ADD COLUMN IF NOT EXISTS "discountValue" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "options" TEXT,
ADD COLUMN IF NOT EXISTS "packaging" TEXT DEFAULT 'طرد',
ADD COLUMN IF NOT EXISTS "itemsPerPackage" TEXT,
ADD COLUMN IF NOT EXISTS "minOrder" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS "hidePrice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "sku" TEXT,
ADD COLUMN IF NOT EXISTS "mainCategoryId" TEXT;

CREATE INDEX IF NOT EXISTS "Product_mainCategoryId_idx" ON "Product"("mainCategoryId");
CREATE INDEX IF NOT EXISTS "Product_isTrending_idx" ON "Product"("isTrending");
CREATE INDEX IF NOT EXISTS "Product_createdAt_idx" ON "Product"("createdAt");
CREATE INDEX IF NOT EXISTS "Product_categoryId_createdAt_idx" ON "Product"("categoryId", "createdAt");
CREATE INDEX IF NOT EXISTS "Product_brandId_createdAt_idx" ON "Product"("brandId", "createdAt");
CREATE INDEX IF NOT EXISTS "Product_mainCategoryId_createdAt_idx" ON "Product"("mainCategoryId", "createdAt");
CREATE INDEX IF NOT EXISTS "Product_price_idx" ON "Product"("price");
CREATE INDEX IF NOT EXISTS "Product_stock_idx" ON "Product"("stock");
CREATE INDEX IF NOT EXISTS "Product_categoryId_price_idx" ON "Product"("categoryId", "price");
CREATE INDEX IF NOT EXISTS "Product_brandId_price_idx" ON "Product"("brandId", "price");
CREATE INDEX IF NOT EXISTS "Product_updatedAt_idx" ON "Product"("updatedAt");
CREATE INDEX IF NOT EXISTS "Product_discountPrice_idx" ON "Product"("discountPrice");
CREATE INDEX IF NOT EXISTS "Product_isTrending_updatedAt_idx" ON "Product"("isTrending", "updatedAt");

-- 9. Order Columns & Indexes
ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "city" TEXT,
ADD COLUMN IF NOT EXISTS "streetAddress" TEXT,
ADD COLUMN IF NOT EXISTS "Name" TEXT,
ADD COLUMN IF NOT EXISTS "phone" TEXT,
ADD COLUMN IF NOT EXISTS "shopName" TEXT,
ADD COLUMN IF NOT EXISTS "notes" TEXT,
ADD COLUMN IF NOT EXISTS "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "promoCodeId" TEXT,
ADD COLUMN IF NOT EXISTS "customerId" TEXT;

UPDATE "Order" SET "city" = 'Damascus' WHERE "city" IS NULL;
UPDATE "Order" SET "streetAddress" = COALESCE("address", 'Main Street') WHERE "streetAddress" IS NULL;
UPDATE "Order" SET "Name" = 'Customer' WHERE "Name" IS NULL;
UPDATE "Order" SET "phone" = '+963000000000' WHERE "phone" IS NULL;

ALTER TABLE "Order" ALTER COLUMN "city" SET NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "streetAddress" SET NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "Name" SET NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "phone" SET NOT NULL;

ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_userId_fkey";
DROP INDEX IF EXISTS "Order_userId_idx";
ALTER TABLE "Order" DROP COLUMN IF EXISTS "userId";
ALTER TABLE "Order" DROP COLUMN IF EXISTS "address";

CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");
CREATE INDEX IF NOT EXISTS "Order_promoCodeId_idx" ON "Order"("promoCodeId");
CREATE INDEX IF NOT EXISTS "Order_customerId_idx" ON "Order"("customerId");

-- 10. OrderItem Columns
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "options" TEXT;

-- 11. Review Table
CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "image" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Review_productId_idx" ON "Review"("productId");
CREATE INDEX IF NOT EXISTS "Review_productId_isApproved_idx" ON "Review"("productId", "isApproved");
CREATE INDEX IF NOT EXISTS "Review_isApproved_createdAt_idx" ON "Review"("isApproved", "createdAt");

-- 12. WishlistItem Table
CREATE TABLE IF NOT EXISTS "WishlistItem" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WishlistItem_customerId_productId_key" ON "WishlistItem"("customerId", "productId");
CREATE INDEX IF NOT EXISTS "WishlistItem_customerId_idx" ON "WishlistItem"("customerId");
CREATE INDEX IF NOT EXISTS "WishlistItem_productId_idx" ON "WishlistItem"("productId");

-- 13. Post Table
CREATE TABLE IF NOT EXISTS "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "excerptAr" TEXT,
    "content" TEXT NOT NULL,
    "contentAr" TEXT,
    "image" TEXT,
    "category" TEXT NOT NULL DEFAULT 'أخبار الشركة',
    "categoryAr" TEXT DEFAULT 'أخبار الشركة',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Post_slug_key" ON "Post"("slug");
CREATE INDEX IF NOT EXISTS "Post_isPublished_createdAt_idx" ON "Post"("isPublished", "createdAt");
CREATE INDEX IF NOT EXISTS "Post_category_idx" ON "Post"("category");

-- 14. Settings Defaults Alignment
ALTER TABLE "Settings"
ALTER COLUMN "footerBrandTitle" SET DEFAULT 'Hawa Distribution',
ALTER COLUMN "footerBrandTitleAr" SET DEFAULT 'حوا للتوزيع والتجارة',
ALTER COLUMN "footerBrandDescription" SET DEFAULT 'Your trusted partner in wholesale food and consumer goods distribution from top brands.',
ALTER COLUMN "footerBrandDescriptionAr" SET DEFAULT 'شريككم الموثوق لتوزيع البضائع والمواد الغذائية والاستهلاكية من أفضل الشركات.',
ALTER COLUMN "footerCopyright" SET DEFAULT '© 2026 Hawa Distribution & Trading. All rights reserved.',
ALTER COLUMN "footerCopyrightAr" SET DEFAULT '© 2026 حوا للتوزيع والتجارة. جميع الحقوق محفوظة.',
ALTER COLUMN "footerInstagramUrl" SET DEFAULT '#',
ALTER COLUMN "footerFacebookUrl" SET DEFAULT '#',
ALTER COLUMN "footerWhatsappUrl" SET DEFAULT '#',
ALTER COLUMN "footerSupportLink1Url" SET DEFAULT '#',
ALTER COLUMN "footerSupportLink2LabelAr" SET DEFAULT 'التوزيع والتسليم',
ALTER COLUMN "footerSupportLink3Url" SET DEFAULT '#';

-- 15. Foreign Key Constraints
DO $$ BEGIN
    ALTER TABLE "Category" ADD CONSTRAINT "Category_mainCategoryId_fkey" FOREIGN KEY ("mainCategoryId") REFERENCES "MainCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Product" ADD CONSTRAINT "Product_mainCategoryId_fkey" FOREIGN KEY ("mainCategoryId") REFERENCES "MainCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Brand" ADD CONSTRAINT "Brand_mainCategoryId_fkey" FOREIGN KEY ("mainCategoryId") REFERENCES "MainCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Order" ADD CONSTRAINT "Order_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
