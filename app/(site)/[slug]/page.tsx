import React from 'react';
import { prisma } from "@/lib/prisma";
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductGallery from '@/app/components/ProductDetailsComponents/ProductGallery';
import ProductHeader from '@/app/components/ProductDetailsComponents/ProductHeader';
import ProductPrice from '@/app/components/ProductDetailsComponents/ProductPrice';
import ProductActions from '@/app/components/ProductDetailsComponents/ProductActions';
import ProductAccordions from '@/app/components/ProductDetailsComponents/ProductAccordions';
import RelatedProducts from '@/app/components/ProductDetailsComponents/RelatedProducts';

// ProductPageProps removed as it was unused and replaced by inline props

const ProductPage = async (props: { params: Promise<{ slug: string }> }) => {
    const params = await props.params;
    const product = await prisma.product.findFirst({
        where: {
            slug: params.slug,
            brand: { isActive: true },
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
            brand: { isActive: true },
        },
        take: 4,
    });

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
                    
                    <ProductPrice
                        price={product.price.toString()}
                        discountPrice={product.discountPrice?.toString()}
                    />

                    <ProductActions product={{
                        id: product.id,
                        name: product.name,
                        nameAr: product.nameAr,
                        nameEn: product.nameEn,
                        price: Number(product.discountPrice || product.price),
                        image: product.images.split(',')[0],
                        slug: product.slug,
                        options: product.options,
                        description: product.description,
                        descriptionAr: product.descriptionAr,
                        descriptionEn: product.descriptionEn,
                    }} stock={product.stock} />

                    <ProductAccordions 
                        description={product.description}
                        descriptionAr={product.descriptionAr}
                        descriptionEn={product.descriptionEn}
                        options={product.options}
                    />
                </div>
            </div>

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
    );
}

export default ProductPage;
