import React, { cache } from 'react';
import { prisma } from "@/lib/prisma";
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductGallery from '@/app/components/ProductDetailsComponents/ProductGallery';
import ProductHeader from '@/app/components/ProductDetailsComponents/ProductHeader';
import ProductPrice from '@/app/components/ProductDetailsComponents/ProductPrice';
import ProductActions from '@/app/components/ProductDetailsComponents/ProductActions';
import ProductAccordions from '@/app/components/ProductDetailsComponents/ProductAccordions';
import ProductShareButtons from '@/app/components/ProductDetailsComponents/ProductShareButtons';
import RelatedProducts from '@/app/components/ProductDetailsComponents/RelatedProducts';
import Breadcrumbs from '@/app/components/ProductDetailsComponents/Breadcrumbs';
import MobileStickyOrderBar from '@/app/components/ProductDetailsComponents/MobileStickyOrderBar';
import { getI18n } from '@/lib/i18n';

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

    const mainImage = (product.images as string).split(',').map((img: string) => img.trim()).filter(Boolean)[0] || '/logo.png';

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
            url: `/products/${product.slug}`,
            images: [
                {
                    url: mainImage,
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
            images: [mainImage],
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

    // Parallel fetch related products
    const relatedProducts = await prisma.product.findMany({
        where: {
            categoryId: product.categoryId,
            id: { not: product.id },
            brand: { isActive: true },
        },
        take: 4,
    });

    const displayName = (language === 'ar' ? product.nameAr : product.nameEn) || product.name || product.nameAr || '';
    const mainImage = (product.images as string).split(',').map((img: string) => img.trim()).filter(Boolean)[0] || '';

    // Schema.org Product Structured Data
    const productSchema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": displayName,
        "image": mainImage ? [mainImage] : [],
        "description": product.description || displayName,
        "sku": product.id,
        "brand": {
            "@type": "Brand",
            "name": product.brand?.name || "Hawa Distribution",
        },
        "offers": {
            "@type": "Offer",
            "url": `https://hawatrading.com/products/${product.slug}`,
            "priceCurrency": "SYP",
            "price": Number(product.discountPrice || product.price),
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition",
        },
    };

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

    return (
        <div className="grow w-full mx-auto container-custom py-4 lg:py-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify([productSchema, breadcrumbSchema]).replace(/</g, '\\u003c')
                }}
            />

            <Breadcrumbs
                productName={displayName}
                categoryName={product.category?.name}
                categorySlug={product.category?.slug}
            />

            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12 w-full mt-6">
                {/* Product Gallery (Left) */}
                <div className="w-full lg:w-[58.5%] flex-shrink-0 relative">
                    <ProductGallery
                        images={product.images}
                        isTrending={product.isTrending}
                    />
                </div>

                {/* Product Details (Right) */}
                <div className="w-full lg:w-[41.5%] lg:sticky lg:top-[140px] self-start flex flex-col gap-1">
                    <ProductHeader
                        name={product.name}
                        nameAr={product.nameAr}
                        nameEn={product.nameEn}
                        brandName={product.brand?.name}
                        categoryName={product.category?.name}
                    />

                    <ProductPrice
                        price={product.price.toString()}
                        discountPrice={product.discountPrice?.toString()}
                        hidePrice={product.hidePrice}
                    />

                    <ProductActions
                        product={{
                            id: product.id,
                            name: product.name,
                            nameAr: product.nameAr,
                            nameEn: product.nameEn,
                            price: Number(product.discountPrice || product.price),
                            image: mainImage,
                            slug: product.slug,
                            options: product.options,
                            description: product.description,
                            descriptionAr: product.descriptionAr,
                            descriptionEn: product.descriptionEn,
                            packaging: product.packaging,
                            itemsPerPackage: product.itemsPerPackage,
                            minOrder: product.minOrder,
                        }}
                        stock={product.stock}
                    />

                    <ProductAccordions 
                        description={product.description}
                        descriptionAr={product.descriptionAr}
                        descriptionEn={product.descriptionEn}
                        options={product.options}
                    />

                    {/* Social Share & Link Sharing */}
                    <ProductShareButtons
                        productName={displayName}
                        productSlug={product.slug}
                    />
                </div>
            </div>

            {/* Related Products Section */}
            <div className="mt-8 lg:mt-12">
                <RelatedProducts products={relatedProducts.map(p => ({
                    ...p,
                    price: Number(p.price),
                    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
                    discountType: p.discountType,
                    discountValue: p.discountValue ? Number(p.discountValue) : null,
                    createdAt: p.createdAt.toISOString(),
                    updatedAt: p.updatedAt.toISOString(),
                }))} />
            </div>

            <MobileStickyOrderBar
                product={{
                    id: product.id,
                    name: product.name,
                    nameAr: product.nameAr,
                    nameEn: product.nameEn,
                    price: Number(product.discountPrice || product.price),
                    image: mainImage,
                    slug: product.slug,
                    options: product.options,
                    description: product.description,
                    descriptionAr: product.descriptionAr,
                    descriptionEn: product.descriptionEn,
                    packaging: product.packaging,
                    itemsPerPackage: product.itemsPerPackage,
                    minOrder: product.minOrder,
                    hidePrice: product.hidePrice,
                }}
            />
        </div>
    );
}

export default ProductPage;
