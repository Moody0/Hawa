-- CreateExtension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create Trigram GIN Indexes on Product searchable fields
CREATE INDEX IF NOT EXISTS "Product_name_trgm_idx" ON "Product" USING gin ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Product_nameAr_trgm_idx" ON "Product" USING gin ("nameAr" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Product_nameEn_trgm_idx" ON "Product" USING gin ("nameEn" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Product_sku_trgm_idx" ON "Product" USING gin ("sku" gin_trgm_ops);

-- Create Trigram GIN Indexes on Brand and Category for relational search
CREATE INDEX IF NOT EXISTS "Brand_name_trgm_idx" ON "Brand" USING gin ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Category_name_trgm_idx" ON "Category" USING gin ("name" gin_trgm_ops);
