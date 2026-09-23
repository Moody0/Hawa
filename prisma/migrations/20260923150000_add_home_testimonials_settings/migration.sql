-- AlterTable
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "homeTestimonialsEnabled" BOOLEAN DEFAULT true;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "homeTestimonialsBadge" TEXT DEFAULT 'Verified Endorsements';
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "homeTestimonialsBadgeAr" TEXT DEFAULT 'آراء شركائنا';
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "homeTestimonialsTitle" TEXT DEFAULT 'Verified Wholesale Buyer Reviews';
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "homeTestimonialsTitleAr" TEXT DEFAULT 'ثقة أصحاب المحلات والسوبرماركت';
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "homeTestimonialsDesc" TEXT DEFAULT 'Endorsements from verified retail merchants and grocery partners across Syria';
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "homeTestimonialsDescAr" TEXT DEFAULT 'آراء وتجارب شركائنا من تجار التجزئة وأصحاب البقاليات في مختلف المحافظات';
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "homeTestimonialsItems" TEXT;
