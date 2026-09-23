export type BrandDisplayLanguage = "ar" | "en";

export interface LocalizedBrandName {
    name: string;
    nameEn?: string | null;
}

/** Uses the saved English name and only falls back to an existing bilingual value. */
export function getBrandDisplayName(brand: LocalizedBrandName, language: BrandDisplayLanguage): string {
    const englishName = brand.nameEn?.trim();
    if (language === "en" && englishName) return englishName;

    const legacyParts = brand.name.split(/\s+[–—-]\s+/).map((part) => part.trim()).filter(Boolean);
    if (legacyParts.length > 1) {
        const localizedPart = legacyParts.find((part) =>
            language === "ar" ? /[\u0600-\u06FF]/.test(part) : /[A-Za-z]/.test(part),
        );
        if (localizedPart) return localizedPart;
    }

    return brand.name;
}
