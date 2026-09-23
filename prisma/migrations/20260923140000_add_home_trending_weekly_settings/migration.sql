ALTER TABLE "Settings"
ADD COLUMN IF NOT EXISTS "homeTrendingWeeklyEnabled" BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS "homeTrendingWeeklyBadge" TEXT DEFAULT 'Market demand',
ADD COLUMN IF NOT EXISTS "homeTrendingWeeklyBadgeAr" TEXT DEFAULT 'طلب السوق',
ADD COLUMN IF NOT EXISTS "homeTrendingWeeklyTitle" TEXT DEFAULT 'Fast-Moving Weekly Products',
ADD COLUMN IF NOT EXISTS "homeTrendingWeeklyTitleAr" TEXT DEFAULT 'المنتجات الأكثر طلباً هذا الأسبوع',
ADD COLUMN IF NOT EXISTS "homeTrendingWeeklyDesc" TEXT DEFAULT 'Highest volume FMCG demands ordered by merchants this week',
ADD COLUMN IF NOT EXISTS "homeTrendingWeeklyDescAr" TEXT DEFAULT 'الأصناف الأكثر حركة وسحباً من قبل المحلات والسوبرماركت بأسعار تفضيلية',
ADD COLUMN IF NOT EXISTS "homeTrendingWeeklyProductIds" TEXT;
