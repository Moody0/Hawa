import React, { cache } from 'react';
import { prisma } from "@/lib/prisma";
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductGallery from '@/app/components/ProductDetailsComponents/ProductGallery';
import ProductHeader from '@/app/components/ProductDetailsComponents/ProductHeader';
import ProductActions from '@/app/components/ProductDetailsComponents/ProductActions';
import ProductAccordions from '@/app/components/ProductDetailsComponents/ProductAccordions';
import ProductShareButtons from '@/app/components/ProductDetailsComponents/ProductShareButtons';
import RelatedProducts from '@/app/components/ProductDetailsComponents/RelatedProducts';
import Breadcrumbs from '@/app/components/ProductDetailsComponents/Breadcrumbs';
import MobileStickyOrderBar from '@/app/components/ProductDetailsComponents/MobileStickyOrderBar';
import { ProductPurchaseProvider } from '@/app/context/ProductPurchaseContext';
import { getI18n } from '@/lib/i18n';
import { canViewWholesalePrices, projectProductPrices, projectProductsPrices } from '@/lib/price-visibility';
import { SITE_ORIGIN, toAbsoluteImageUrl } from '@/lib/site-config';

export const revalidate = 60; // Revalidate cache every 60 seconds

const getProduct = cache(async (slug: string) => {
    return prisma.product.findFirst({
        where: {
            slug,
            brand: { isActive: true },
        },
        include: {
            brand: true,
            category: true,
        },
    });
});

export async function generateMetadata(
    props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const params = await props.params;
    const product = await getProduct(params.slug);

    if (!product) {
        return {
            title: 'منتج غير موجود | Hawa Distribution',
        };
    }

    const title = `${product.name} | Hawa Distribution - حوا للتوزيع`;
    const brandName = product.brand?.name ? product.brand.name.split('-')[0].trim() : 'Hawa';
    const description = product.description 
        ? `${product.name} من وكالة ${brandName}. متوفر للطلب والبيع بالجملة مع شحن موثوق عبر شركة حوا للتوزيع والتجارة. ${product.description.slice(0, 120)}`
        : `اشترِ ${product.name} من وكالة ${brandName} بأفضل أسعار الجملة المعتمدة من شركة حوا للتوزيع والتجارة.`;

    const rawImage = (product.images as string).split(',').map((img: string) => img.trim()).filter(Boolean)[0];
    const imageUrl = toAbsoluteImageUrl(rawImage);

    return {
        title,
        description,
        alternates: {
            canonical: `/products/${product.slug}`,
        },
        openGraph: {
            title,
            description,
            type: 'article',
            url: `${SITE_ORIGIN}/products/${product.slug}`,
            siteName: 'حوا للتوزيع والتجارة | Hawa Distribution & Trading',
            locale: 'ar_SY',
            images: [
                {
                    url: imageUrl,
                    secureUrl: imageUrl.startsWith('https://') ? imageUrl : undefined,
                    width: 1200,
                    height: 630,
                    alt: product.name,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    };
}

const ProductPage = async (props: { params: Promise<{ slug: string }> }) => {
    const params = await props.params;
    const { language } = await getI18n();

    const product = await getProduct(params.slug);

    if (!product) {
        notFound();
    }

    // Parallel fetch up to 12 related products
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let relatedProducts: any[] = [];
    try {
        relatedProducts = await prisma.product.findMany({
            where: {
                categoryId: product.categoryId,
                id: { not: product.id },
                brand: { isActive: true },
            },
            include: {
                brand: true,
                category: true,
            },
            take: 12,
        });

        if (relatedProducts.length < 12) {
            const existingIds = [product.id, ...relatedProducts.map(p => p.id)];
            const additionalProducts = await prisma.product.findMany({
                where: {
                    id: { notIn: existingIds },
                    brand: { isActive: true },
                    OR: [
                        { brandId: product.brandId },
                        { isTrending: true },
                    ],
                },
                include: {
                    brand: true,
                    category: true,
                },
                take: 12 - relatedProducts.length,
            });
            relatedProducts = [...relatedProducts, ...additionalProducts];
        }
    } catch (e) {
        console.error("Error fetching related products:", e);
    }

    const canViewPrices = await canViewWholesalePrices();
    const safeProduct = projectProductPrices(product, canViewPrices);
    const safeRelatedProducts = projectProductsPrices(relatedProducts, canViewPrices);

    const displayName = (language === 'ar' ? safeProduct.nameAr : safeProduct.nameEn) || safeProduct.name || safeProduct.nameAr || '';
    const mainImage = (safeProduct.images as string).split(',').map((img: string) => img.trim()).filter(Boolean)[0] || '';

    // Schema.org Product Structured Data
    const productSchema: Record<string, unknown> = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": displayName,
        "image": mainImage ? [mainImage] : [],
        "description": safeProduct.description || displayName,
        "sku": safeProduct.id,
        "brand": {
            "@type": "Brand",
            "name": safeProduct.brand?.name || "Hawa Distribution",
        },
    };

    if (canViewPrices && (safeProduct.price || safeProduct.discountPrice)) {
        productSchema.offers = {
            "@type": "Offer",
            "url": `https://hawatrading.com/products/${safeProduct.slug}`,
            "priceCurrency": "SYP",
            "price": Number(safeProduct.discountPrice || safeProduct.price),
            "availability": safeProduct.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition",
        };
    }

    // Schema.org BreadcrumbList Structured Data
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": language === "ar" ? "الرئيسية" : "Home",
                "item": "https://hawatrading.com",
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": language === "ar" ? "المنتجات" : "Products",
                "item": "https://hawatrading.com/products",
            },
            ...(product.category
                ? [
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": product.category.name,
                        "item": `https://hawatrading.com/categories/${product.category.slug}`,
                    },
                    {
                        "@type": "ListItem",
                        "position": 4,
                        "name": displayName,
                        "item": `https://hawatrading.com/products/${product.slug}`,
                    },
                ]
                : [
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": displayName,
                        "item": `https://hawatrading.com/products/${product.slug}`,
                    },
                ]),
        ],
    };

    const purchaseProductData = {
        id: safeProduct.id,
        name: safeProduct.name,
        nameAr: safeProduct.nameAr,
        nameEn: safeProduct.nameEn,
        price: safeProduct.price !== null ? Number(safeProduct.price) : 0,
        discountPrice: safeProduct.discountPrice !== null ? Number(safeProduct.discountPrice) : null,
        hidePrice: safeProduct.hidePrice,
        image: mainImage,
        slug: safeProduct.slug,
        options: safeProduct.options,
        description: safeProduct.description,
        descriptionAr: safeProduct.descriptionAr,
        descriptionEn: safeProduct.descriptionEn,
        packaging: safeProduct.packaging,
        itemsPerPackage: safeProduct.itemsPerPackage,
        minOrder: safeProduct.minOrder,
    };

    return (
        <ProductPurchaseProvider product={purchaseProductData} stock={safeProduct.stock}>
            <div className="mx-auto container-custom py-4 sm:py-6 lg:py-8">
                {/* Microdata / Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                />

                {/* Breadcrumb Navigation */}
                <Breadcrumbs
                    productName={displayName}
                    categoryName={product.category?.name}
                    categorySlug={product.category?.slug}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 xl:gap-10 w-full mt-3 sm:mt-5 items-start">
                    {/* Product Gallery (Left) */}
                    <div className="w-full lg:col-span-6 relative">
                        <ProductGallery
                            images={product.images}
                            isTrending={product.isTrending}
                        />
                    </div>

                    {/* Product Details (Right) */}
                    <div className="w-full lg:col-span-6 lg:sticky lg:top-24 self-start flex flex-col gap-1 lg:rounded-2xl lg:border lg:border-slate-200/80 lg:bg-white lg:p-6 xl:p-8 lg:shadow-[0_18px_50px_-36px_rgba(11,25,44,0.45)] dark:lg:border-white/10 dark:lg:bg-zinc-900/70">
                        <ProductHeader
                            name={product.name}
                            nameAr={product.nameAr}
                            nameEn={product.nameEn}
                            brand={product.brand}
                            category={product.category}
                        />

                        <ProductActions
                            product={purchaseProductData}
                            stock={safeProduct.stock}
                        />

                        <ProductAccordions 
                            description={safeProduct.description}
                            descriptionAr={safeProduct.descriptionAr}
                            descriptionEn={safeProduct.descriptionEn}
                            options={safeProduct.options}
                        />

                        {/* Social Share & Link Sharing */}
                        <ProductShareButtons
                            productName={displayName}
                            productSlug={safeProduct.slug}
                        />
                    </div>
                </div>

                {/* Related Products Section */}
                <div>
                    <RelatedProducts products={safeRelatedProducts.map(p => ({
                        ...p,
                        price: p.price !== null ? Number(p.price) : 0,
                        discountPrice: p.discountPrice !== null ? Number(p.discountPrice) : null,
                        discountType: p.discountType,
                        discountValue: p.discountValue !== null ? Number(p.discountValue) : null,
                        createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : (p.createdAt ? String(p.createdAt) : new Date().toISOString()),
                        updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : (p.updatedAt ? String(p.updatedAt) : new Date().toISOString()),
                    }))} />
                </div>

                <MobileStickyOrderBar
                    stock={safeProduct.stock}
                    product={purchaseProductData}
                />
            </div>
        </ProductPurchaseProvider>
    );
}

export default ProductPage;
