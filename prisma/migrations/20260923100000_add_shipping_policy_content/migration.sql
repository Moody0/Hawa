ALTER TABLE "Settings"
ADD COLUMN IF NOT EXISTS "shippingPolicyContent" JSONB;
