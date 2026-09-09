import { prisma } from "./prisma";

const BRAND_SLUG_FALLBACK = "brand";

function randomSuffix() {
    return Math.random().toString(36).substring(2, 7);
}

export function createBrandSlugBase(name: string) {
    const slug = name
        .toLowerCase()
        .trim()
        .replace(/&/g, "g")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return slug || BRAND_SLUG_FALLBACK;
}

export async function generateUniqueBrandSlug(name: string, excludeId?: string) {
    let slug = createBrandSlugBase(name);

    const existingBrand = await prisma.brand.findFirst({
        where: {
            slug,
            ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: {
            id: true,
        },
    });

    if (existingBrand) {
        slug = `${slug}-${randomSuffix()}`;
    }

    return slug;
}
