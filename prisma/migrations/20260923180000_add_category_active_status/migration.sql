ALTER TABLE "Category"
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "Category_isActive_archivedAt_idx"
ON "Category"("isActive", "archivedAt");
