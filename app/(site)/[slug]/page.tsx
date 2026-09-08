import React from 'react';
import { prisma } from "@/lib/prisma";
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductGallery from '@/app/components/ProductDetailsComponents/ProductGallery';
import ProductHeader from '@/app/components/ProductDetailsComponents/ProductHeader';
import ProductActions from '@/app/components/ProductDetailsComponents/ProductActions';
import ProductAccordions from '@/app/components/ProductDetailsComponents/ProductAccordions';
import RelatedProducts from '@/app/components/ProductDetailsComponents/RelatedProducts';
import { canViewWholesalePrices, projectProductPrices, projectProductsPrices } from '@/lib/price-visibility';

// ProductPageProps removed as it was unused and replaced by inline props

const ProductPage = async (props: { params: Promise<{ slug: string }> }) => {
    const params = await props.params;
    const product = await prisma.product.findFirst({
        where: {
            slug: params.slug,
            archivedAt: null,
            brand: { isActive: true, archivedAt: null },
        },
        include: {
            brand: true,
        },
    });

    if (!product) {
        notFound();
    }

    // Fetch related products (same category, exclude current)
    const relatedProducts = await prisma.product.findMany({
        where: {
            categoryId: product.categoryId,
            brandId: product.brandId,
            id: { not: product.id },
            archivedAt: null,
            brand: { isActive: true, archivedAt: null },
        },
        take: 4,
    });
    const canViewPrices = await canViewWholesalePrices();
    const safeProduct = projectProductPrices(product, canViewPrices);
    const safeRelatedProducts = projectProductsPrices(relatedProducts, canViewPrices);

    return (
        <div className="grow w-full mx-auto px-6 py-8 md:px-20 lg:px-32 xl:px-48 2xl:px-64 lg:py-12">
            
            <div className="flex flex-col lg:grid lg:grid-cols-5 gap-12 xl:gap-20">
                {/* Product Gallery (Left) */}
                <div className="lg:col-span-2 order-1">
                    <ProductGallery 
                        images={product.images} 
                        isTrending={product.isTrending} 
                    />
                </div>

                {/* Product Details (Right) */}
                <div className="flex flex-col lg:col-span-3 order-2">
                    {/* Header (Title & Description) - Visible on all screens now */}
                    <div className="block">
                        <ProductHeader
                            name={product.name}
                            nameAr={product.nameAr}
                            nameEn={product.nameEn}
                        />
                        {product.brand && (
                            <Link
                                href={`/products?brand=${product.brand.slug}`}
                                className="mb-4 mt-2 inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
                            >
                                {product.brand.name}
                            </Link>
                        )}
                    </div>
                    
                    <ProductActions product={{
                        id: product.id,
                        name: product.name,
                        nameAr: product.nameAr,
                        nameEn: product.nameEn,
                        price: safeProduct.price == null ? 0 : Number(safeProduct.price),
                        discountPrice: safeProduct.discountPrice == null ? null : Number(safeProduct.discountPrice),
                        hidePrice: product.hidePrice || !canViewPrices,
                        image: product.images.split(',')[0],
                        slug: product.slug,
                        options: product.options,
                        description: product.description,
                        descriptionAr: product.descriptionAr,
                        descriptionEn: product.descriptionEn,
                        packaging: product.packaging,
                        itemsPerPackage: product.itemsPerPackage,
                        minOrder: product.minOrder,
                    }} stock={product.stock} />

                    <ProductAccordions 
                        description={product.description}
                        descriptionAr={product.descriptionAr}
                        descriptionEn={product.descriptionEn}
                        options={product.options}
                    />
                </div>
            </div>

            <RelatedProducts products={safeRelatedProducts.map(p => ({
                ...p,
                price: p.price == null ? 0 : Number(p.price),
                discountPrice: p.discountPrice == null ? null : Number(p.discountPrice),
                discountType: p.discountType,
                discountValue: p.discountValue ? Number(p.discountValue) : null,
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString(),
            }))} />
        </div>
    );
}

export default ProductPage;
