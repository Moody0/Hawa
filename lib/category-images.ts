/**
 * Category Bundle Images Mapping
 * High-resolution isolated product bundle packshots without backgrounds.
 */
export const CATEGORY_BUNDLE_IMAGES: Record<string, string> = {
    // سمن وزيت
    'cooking-oil-ghee': '/images/categories/cooking-oil-ghee.webp',
    'سمن وزيت': '/images/categories/cooking-oil-ghee.webp',
    'سمن': '/images/categories/cooking-oil-ghee.webp',
    'زيوت': '/images/categories/cooking-oil-ghee.webp',
    'زيت': '/images/categories/cooking-oil-ghee.webp',
    'oil': '/images/categories/cooking-oil-ghee.webp',
    'ghee': '/images/categories/cooking-oil-ghee.webp',

    // بقوليات
    'legumes-rice-grains': '/images/categories/legumes-rice-grains.webp',
    'بقوليات': '/images/categories/legumes-rice-grains.webp',
    'ارز': '/images/categories/legumes-rice-grains.webp',
    'أرز': '/images/categories/legumes-rice-grains.webp',
    'حبوب': '/images/categories/legumes-rice-grains.webp',
    'legumes': '/images/categories/legumes-rice-grains.webp',
    'rice': '/images/categories/legumes-rice-grains.webp',
    'grains': '/images/categories/legumes-rice-grains.webp',

    // عناية بالأسنان
    'dental-oral-care': '/images/categories/dental-oral-care.webp',
    'عناية بالاسنان': '/images/categories/dental-oral-care.webp',
    'عناية بالأسنان': '/images/categories/dental-oral-care.webp',
    'اسنان': '/images/categories/dental-oral-care.webp',
    'أسنان': '/images/categories/dental-oral-care.webp',
    'dental': '/images/categories/dental-oral-care.webp',
    'oral': '/images/categories/dental-oral-care.webp',

    // عناية بالجسم والشعر
    'body-hair-care': '/images/categories/body-hair-care.webp',
    'عناية بالجسم والشعر': '/images/categories/body-hair-care.webp',
    'عناية بالجسم': '/images/categories/body-hair-care.webp',
    'عناية بالشعر': '/images/categories/body-hair-care.webp',
    'شامبو': '/images/categories/body-hair-care.webp',
    'body': '/images/categories/body-hair-care.webp',
    'hair': '/images/categories/body-hair-care.webp',

    // محارم
    'tissues-wet-wipes': '/images/categories/tissues-wet-wipes.webp',
    'محارم': '/images/categories/tissues-wet-wipes.webp',
    'مناديل': '/images/categories/tissues-wet-wipes.webp',
    'مناديل مبللة': '/images/categories/tissues-wet-wipes.webp',
    'tissues': '/images/categories/tissues-wet-wipes.webp',
    'wipes': '/images/categories/tissues-wet-wipes.webp',

    // جلي
    'dishwashing-liquid': '/images/categories/dishwashing-liquid.webp',
    'جلي': '/images/categories/dishwashing-liquid.webp',
    'سائل جلي': '/images/categories/dishwashing-liquid.webp',
    'معجون جلي': '/images/categories/dishwashing-liquid.webp',
    'dishwashing': '/images/categories/dishwashing-liquid.webp',
    'dish': '/images/categories/dishwashing-liquid.webp',

    // صابون
    'liquid-hand-soap': '/images/categories/liquid-hand-soap.webp',
    'صابون': '/images/categories/liquid-hand-soap.webp',
    'غسول ايدي': '/images/categories/liquid-hand-soap.webp',
    'غسول أيدي': '/images/categories/liquid-hand-soap.webp',
    'soap': '/images/categories/liquid-hand-soap.webp',
    'hand-soap': '/images/categories/liquid-hand-soap.webp',

    // ملمعات
    'glass-surface-cleaners': '/images/categories/glass-surface-cleaners.webp',
    'ملمعات': '/images/categories/glass-surface-cleaners.webp',
    'ملمع': '/images/categories/glass-surface-cleaners.webp',
    'منظف زجاج': '/images/categories/glass-surface-cleaners.webp',
    'منظفات اسطح': '/images/categories/glass-surface-cleaners.webp',
    'glass': '/images/categories/glass-surface-cleaners.webp',
    'cleaners': '/images/categories/glass-surface-cleaners.webp',

    // غسيل
    'laundry-detergents': '/images/categories/laundry-detergents.webp',
    'غسيل': '/images/categories/laundry-detergents.webp',
    'مسحوق غسيل': '/images/categories/laundry-detergents.webp',
    'منظف غسيل': '/images/categories/laundry-detergents.webp',
    'laundry': '/images/categories/laundry-detergents.webp',
    'detergent': '/images/categories/laundry-detergents.webp',

    // مطهر ومعقم
    'antiseptics-disinfectants': '/images/categories/antiseptics-disinfectants.webp',
    'مطهر ومعقم': '/images/categories/antiseptics-disinfectants.webp',
    'مطهر': '/images/categories/antiseptics-disinfectants.webp',
    'معقم': '/images/categories/antiseptics-disinfectants.webp',
    'مطهرات': '/images/categories/antiseptics-disinfectants.webp',
    'معقمات': '/images/categories/antiseptics-disinfectants.webp',
    'antiseptic': '/images/categories/antiseptics-disinfectants.webp',
    'disinfectant': '/images/categories/antiseptics-disinfectants.webp',

    // معلبات
    'canned-foods': '/images/categories/canned-foods.webp',
    'معلبات': '/images/categories/canned-foods.webp',
    'سردين': '/images/categories/canned-foods.webp',
    'تونة': '/images/categories/canned-foods.webp',
    'طونة': '/images/categories/canned-foods.webp',
    'لانشون': '/images/categories/canned-foods.webp',
    'canned': '/images/categories/canned-foods.webp',
};

export function getCategoryBundleImage(name?: string | null, slug?: string | null, fallback?: string | null): string {
    const normalize = (text: string) => text.toLowerCase().replace(/^(ال|al-|el-)/i, '').replace(/[\s\-_]+/g, '').trim();

    const candidates = [name, slug].filter(Boolean) as string[];
    for (const cand of candidates) {
        const normCand = normalize(cand);
        for (const [key, img] of Object.entries(CATEGORY_BUNDLE_IMAGES)) {
            const normKey = normalize(key);
            if (normCand === normKey || normCand.includes(normKey) || normKey.includes(normCand)) {
                return img;
            }
        }
    }

    return fallback || '/placeholder.svg';
}
