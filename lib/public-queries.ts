import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BrandGroup } from "@prisma/client";
import { CONTACT_CONFIG } from "@/lib/site-config";
import { getCategoryBundleImage } from "@/lib/category-images";

export interface RailBrand {
    id: string;
    name: string;
    nameAr: string;
    fullName: string;
    slug: string;
    description?: string | null;
    image: string;
    productCount?: number;
}

export interface HomeBrand {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    group: BrandGroup;
    _count?: {
        products: number;
        categories: number;
    };
}

export const DEFAULT_SITE_SETTINGS = {
    id: "site-settings",
    categoriesCtaTitle: "Looking for specific wholesale brands?",
    categoriesCtaDesc: "Our wholesale team is ready to provide custom pricing and scheduled deliveries for your business.",
    categoriesCtaTitleAr: "تبحث عن شركات أو منتجات محددة؟",
    categoriesCtaDescAr: "فريق المبيعات لدينا جاهز لتزويدكم بأفضل أسعار الجملة وجداول التوزيع المنتظمة.",
    categoriesCtaImage: "/uploads/banners/hawa-food-agencies-banner.jpg",
    footerBrandTitle: "Hawa Distribution",
    footerBrandTitleAr: "شركة حوا للتوزيع والتجارة",
    footerBrandDescription: "Your trusted partner in wholesale food and consumer goods distribution from top international brands.",
    footerBrandDescriptionAr: "شريككم الموثوق لتوزيع البضائع والمواد الغذائية من أفضل الشركات العالمية.",
    footerCopyright: "© 2026 Hawa Distribution. All rights reserved.",
    footerCopyrightAr: "© 2026 شركة حوا للتوزيع والتجارة. جميع الحقوق محفوظة.",
    footerInstagramUrl: "#",
    footerFacebookUrl: "#",
    footerWhatsappUrl: "#",
    whatsappNumber: CONTACT_CONFIG.salesWhatsApp,
    footerShopTitle: "Shop",
    footerShopTitleAr: "المتجر",
    footerSupportTitle: "Support",
    footerSupportTitleAr: "الدعم",
    footerCompanyTitle: "Company",
    footerCompanyTitleAr: "الشركة",
    footerSupportLink1Label: "Help Center",
    footerSupportLink1LabelAr: "مركز المساعدة",
    footerSupportLink1Url: "#",
    footerSupportLink2Label: "Shipping & Returns",
    footerSupportLink2LabelAr: "التوزيع والتسليم",
    footerSupportLink2Url: "/shipping-returns",
    footerSupportLink3Label: "Contact Us",
    footerSupportLink3LabelAr: "اتصل بنا",
    footerSupportLink3Url: "#",
    footerCompanyLink1Label: "About Us",
    footerCompanyLink1LabelAr: "من نحن",
    footerCompanyLink1Url: "/about-us",
    footerCompanyLink2Label: "",
    footerCompanyLink2LabelAr: "",
    footerCompanyLink2Url: "",
    footerCompanyLink3Label: "",
    footerCompanyLink3LabelAr: "",
    footerCompanyLink3Url: "",
    footerCategory1Id: null,
    footerCategory2Id: null,
    footerCategory3Id: null,
    footerCategory4Id: null,
    shippingTitle: "Fast & Reliable Distribution",
    shippingDesc: "We ensure wholesale goods reach your business in perfect condition.",
    shippingTitleAr: "توزيع سريع وموثوق",
    shippingDescAr: "نحن نضمن وصول بضائع الجملة إلى نشاطكم التجاري في أفضل حالة.",
    verificationTitle: "Verification Process",
    verificationDesc: "Orders are verified and scheduled immediately with our logistics fleet.",
    verificationTitleAr: "عملية التحقق",
    verificationDescAr: "يتم التحقق من الطلبات وجدولتها فوراً للتوصيل المباشر لباب المحل.",
    standardShippingTime: "1-3 Business Days",
    expressShippingTime: "24 Hours",
    returnsTitle: "Wholesale Support",
    returnsDesc: "We are committed to full satisfaction and verified shipment handling.",
    returnsTitleAr: "دعم الجملة",
    returnsDescAr: "نحن ملتزمون بالجودة والمطابقة التامة للشحنات.",
    finalSaleTitle: "Wholesale Delivery Terms",
    finalSaleDesc: "All goods are shipped in factory-sealed cases conforming to international standards.",
    finalSaleTitleAr: "شروط تسليم الجملة",
    finalSaleDescAr: "يتم تسليم البضائع في كراتين المصنع الأصلية والمطابقة للمواصفات القياسية.",
    hygieneTitle: "Safety & Temperature Storage",
    hygieneDesc: "Our temperature-controlled warehouses ensure optimal quality preservation.",
    hygieneTitleAr: "بروتوكولات السلامة والتخزين",
    hygieneDescAr: "تضمن مستودعاتنا وشاحناتنا درجات حرارة وبيئة تخزين مثالية حتى نقطة التسليم.",
    shippingReturnsImage: "/images/hawa_hero.jpg",
    
    aboutHeroTitle: "Our Story in Wholesale Food & FMCG Distribution",
    aboutHeroTitleAr: "قصتنا في ريادة وتوريد السلع الغذائية والاستهلاكية",
    aboutHeroSubtitle: "Hawa Distribution & Trading: Your certified trade partner bridging top food manufacturing brands with grocery retailers, supermarkets, and wholesalers across Syria.",
    aboutHeroSubtitleAr: "شركة حوا للتوزيع والتجارة: شريككم المعتمد لربط كبرى مصانع المواد الغذائية والاستهلاكية بالمحلات والسوبرماركت وتجار الجملة في كافة المحافظات السورية.",
    middleBanner1Image: "/images/hawa_hero.jpg",
    middleBanner1Link: "/products",
    middleBanner2Image: "/images/hawa_wholesale_hub.jpg",
    middleBanner2Link: "/products",
    middleBanner2Title: "Global & Local Food Brands",
    middleBanner2TitleAr: "شركات ووكالات غذائية رائدة",
    middleBanner2Subtitle: "Discover authentic wholesale food products, pasta, oils, and FMCG essentials.",
    middleBanner2SubtitleAr: "اكتشف أفضل المنتجات الغذائية، المعكرونة، الزيوت، والبقوليات بأسعار الجملة الرسمية.",
    middleBanner2ButtonText: "Explore Catalog",
    middleBanner2ButtonTextAr: "تصفح كتالوج الجملة",
    exchangeRate: 135,
    statDeliveries: "+9000",
    statBrands: "+100",
    statProducts: "+500",
    statClients: "+300",
    aboutHeroImage: "/images/hawa_wholesale_hub.jpg",
    
    aboutNarrativeTitle: "Direct Sourcing, Strict Quality & Full Fleet Reach",
    aboutNarrativeTitleAr: "توريد موثوق، جودة قياسية، وشبكة توزيع متكاملة",
    aboutNarrativeFounded: "Leading Trade Hub",
    aboutNarrativeFoundedAr: "ريادة في توزيع الجملة",
    aboutNarrativeDesc1: "At Hawa Distribution, we operate as the vital supply line for grocery retailers, supermarkets, and wholesalers. We partner directly with leading domestic and international food manufacturers to supply authentic, factory-sealed consumer goods at official wholesale rates.",
    aboutNarrativeDesc1Ar: "في شركة حوا للتوزيع والتجارة، نعمل كشريان إمداد رئيسي لأصحاب السوبرماركت والبقالات وتجار الجملة. نربط كبرى المصانع والشركات المنتجة للسلع الغذائية والاستهلاكية بنقاط البيع مباشرة وبأسعار الجملة المعتمدة.",
    aboutNarrativeDesc2: "With temperature-controlled central warehouses and a dedicated logistics fleet covering all Syrian governorates, we guarantee punctual deliveries, verified shelf-life, and transparent purchase invoicing.",
    aboutNarrativeDesc2Ar: "بفضل مستودعاتنا المركزية المجهزة وشبكة التوزيع المنظمة التي تغطي كافة المحافظات السورية، نضمن مواعيد تسليم دقيقة لباب المحل، مع مطابقة تامة للمواصفات وفواتير رسمية موثقة.",
    aboutNarrativeQuote: "Authentic goods, official carton pricing, and reliable fleet delivery.",
    aboutNarrativeQuoteAr: "بضائع أصلية، كروتة المصنع المعتمدة، وتوصيل منتظم لباب المحل.",
    aboutNarrativeImage: "/images/hawa_hero.jpg",
    
    aboutValuesTitle: "Our Core Trade Pillars",
    aboutValuesTitleAr: "ركائز العمل والتوريد المعتمد",
    aboutValuesDesc: "We are committed to authenticity, transparent wholesale trade terms, and consistent supply chains.",
    aboutValuesDescAr: "نلتزم بأعلى معايير المصداقية، شفافية الأسعار، واستمرارية سلاسل التوريد لقطاع التجزئة والجملة.",
    
    aboutValue1Title: "100% Certified Quality",
    aboutValue1TitleAr: "جودة ومواصفات قياسية",
    aboutValue1Desc: "All goods are factory-sealed in original packaging conforming to Syrian and international food safety standards.",
    aboutValue1DescAr: "جميع البضائع والمنتجات الغذائية أصلية 100% وفي طرود وكراتين المصنع الأصلية مع ضمان الصلاحية والجودة.",
    
    aboutValue2Title: "Direct Factory Sourcing",
    aboutValue2TitleAr: "توريد ووكالات حصرية",
    aboutValue2Desc: "Direct trade partnerships with top food and consumer brands, eliminating middlemen and securing best wholesale rates.",
    aboutValue2DescAr: "شراكات توريد مباشرة مع كبرى الشركات المصنعة لضمان توفر دائم للمنتجات وأسعار جملة منافسة بدون وسطاء.",
    
    aboutValue3Title: "Reliable Fleet Logistics",
    aboutValue3TitleAr: "شبكة توزيع تغطي المحافظات",
    aboutValue3Desc: "Regular scheduled delivery runs directly to your storefront across all 14 governorates.",
    aboutValue3DescAr: "سيارات وشاحنات توزيع مجهزة تنطلق يومياً لخدمة كافة المحافظات بمواعيد تسليم منتظمة ودقيقة لباب المحل.",
    
    updatedAt: new Date(),
};

export const getHomeRailBrands = unstable_cache(
    async (): Promise<RailBrand[]> => {
        try {
            const brands = await prisma.brand.findMany({
                where: {
                    isActive: true,
                    products: {
                        some: {
                            NOT: [
                                { images: '/placeholder.svg' },
                                { images: '' }
                            ]
                        }
                    }
                },
                orderBy: [
                    { isFeatured: 'desc' },
                    { products: { _count: 'desc' } }
                ],
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    image: true,
                    products: {
                        where: {
                            NOT: [
                                { images: '/placeholder.svg' },
                                { images: '' }
                            ]
                        },
                        take: 1,
                        select: { images: true }
                    },
                    _count: {
                        select: { products: true }
                    }
                }
            });

            return brands.map(b => {
                let en = b.name;
                let ar = b.name;
                if (b.name.includes(' - ')) {
                    const parts = b.name.split(' - ').map(s => s.trim());
                    en = parts[0] || b.name;
                    ar = parts[1] || parts[0] || b.name;
                }
                const productImg = b.products[0]?.images ? b.products[0].images.split(',')[0].trim() : null;
                return {
                    id: b.id,
                    name: en,
                    nameAr: ar,
                    fullName: b.name,
                    slug: b.slug,
                    description: b.description,
                    image: b.image || productImg || '/logo.png',
                    productCount: b._count.products
                };
            }).filter(b => b.image && b.image !== '/placeholder.svg');
        } catch (error) {
            console.error("Failed to fetch rail brands:", error);
            return [];
        }
    },
    ["home-rail-brands-v2"],
    { tags: ["brands", "catalog"], revalidate: 3600 }
);

export async function getHomeRailCategories() {
    try {
        const mainCats = await prisma.mainCategory.findMany({
            where: {
                isActive: true,
                NOT: [
                    { image: null },
                    { image: '/placeholder.svg' },
                    { image: '' }
                ]
            },
            orderBy: { navOrder: 'asc' },
            include: {
                products: {
                    where: {
                        price: { gte: 0 },
                        NOT: [
                            { images: '/placeholder.svg' },
                            { images: '' }
                        ]
                    },
                    take: 1,
                    select: { images: true }
                }
            }
        });
        return mainCats.map(mc => {
            const productImg = mc.products[0]?.images ? mc.products[0].images.split(',')[0].trim() : null;
            return {
                id: mc.id,
                name: mc.description || mc.name,
                nameAr: mc.name,
                slug: mc.slug,
                image: mc.image || productImg || ''
            };
        }).filter(c => c.image && c.image !== '/placeholder.svg');
    } catch (error) {
        console.error("Failed to fetch rail categories:", error);
        return [];
    }
}

export const getCategoryHighlightCardsData = unstable_cache(
    async () => {
        try {
            const topMainCats = await prisma.mainCategory.findMany({
                where: {
                    isActive: true,
                    NOT: [
                        { image: null },
                        { image: '/placeholder.svg' },
                        { image: '' }
                    ],
                    products: {
                        some: {
                            price: { gte: 0 },
                            NOT: [
                                { images: '/placeholder.svg' },
                                { images: '' }
                            ]
                        }
                    }
                },
                take: 4,
                orderBy: [
                    { isFeatured: 'desc' },
                    { navOrder: 'asc' }
                ],
                include: {
                    products: {
                        where: {
                            price: { gte: 0 },
                            NOT: [
                                { images: '/placeholder.svg' },
                                { images: '' }
                            ]
                        },
                        take: 1,
                        orderBy: { isTrending: 'desc' },
                        select: {
                            id: true,
                            name: true,
                            nameAr: true,
                            nameEn: true,
                            price: true,
                            images: true,
                            slug: true
                        }
                    },
                    brands: {
                        take: 2,
                        select: { name: true }
                    }
                }
            });
            return topMainCats.map(mc => {
                const firstProd = mc.products[0];
                const brandNames = mc.brands.map(b => b.name).join(' & ');
                const prodImg = firstProd?.images ? firstProd.images.split(',')[0].trim() : (mc.image || '');
                return {
                    id: mc.id,
                    slug: mc.slug,
                    subheadingAr: mc.name,
                    subheadingEn: mc.description || mc.name,
                    headingAr: brandNames || mc.name,
                    headingEn: brandNames || mc.description || mc.name,
                    productNameAr: firstProd?.nameAr || firstProd?.name || mc.name,
                    productNameEn: firstProd?.nameEn || firstProd?.name || mc.description || mc.name,
                    priceText: firstProd?.price && Number(firstProd.price) > 0 ? `$${Number(firstProd.price).toFixed(2)}` : '',
                    heroImage: mc.image || prodImg,
                    productThumb: prodImg,
                    productSlug: firstProd?.slug || ''
                };
            });
        } catch (error) {
            console.error("Failed to fetch highlight cards data:", error);
            return [];
        }
    },
    ["category-highlight-cards"],
    { tags: ["categories", "catalog"], revalidate: 3600 }
);

export const getApprovedReviews = unstable_cache(
    async () => {
        try {
            const reviews = await prisma.review.findMany({
                where: { isApproved: true, archivedAt: null, product: { archivedAt: null } },
                take: 12,
                orderBy: { createdAt: 'desc' },
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            nameAr: true,
                            nameEn: true,
                            images: true,
                            slug: true
                        }
                    }
                }
            });
            if (reviews.length === 0) {
                const sampleProducts = await prisma.product.findMany({
                    where: { images: { not: '' }, archivedAt: null },
                    take: 8,
                    select: { name: true, nameAr: true, nameEn: true, images: true, slug: true }
                });

                const profiles = [
                    { name: 'سوبرماركت الشام الحديث (دمشق - كفرسوسة)', feedback: 'أفضل موزع معتمد لوكالات زوان والريف. سرعة استثنائية في تلبية طلبيات الطرود وتأكيد مباشر وسلس عبر واتساب.' },
                    { name: 'ميني ماركت الهدى (المزة)', feedback: 'التوريد منتظم جداً ومواصفات التعبئة واضحة بالطرود، مما يسهل جرد وتوزيع البضائع في المحل بدقة وبدون أي نقص.' },
                    { name: 'بقالة البركة التجارية (مشروع دمر)', feedback: 'توفير كبرى الوكالات بطلب واحد وفر علينا وقتاً كبيراً في التواصل واللوجستيات مع الموزعين المتفرقين.' },
                    { name: 'سوبرماركت الواحة (القصاع)', feedback: 'منتجات حليبنا المجففة وتونة سيلفر فيش دائماً متوفرة وتواريخ الصلاحية حديثة جداً ومضمونة من المستودعات.' },
                    { name: 'مطعم ومقهى ديلايت (المالكي)', feedback: 'اعتمادنا على شركة حوا في توريد زيوت القلي ومعلبات اللحوم والصلصات وفر لنا استقراراً كبيراً في الجودة والأسعار.' },
                    { name: 'ماركت المدينة المنورة (التجارة)', feedback: 'خدمة التوصيل المباشر لباب السوبرماركت ممتازة، والشاحنات مجهزة ومبردة لحفظ سلامة المعلبات والبضائع.' },
                    { name: 'بقالة النجوم (الميدان)', feedback: 'المعاملة راقية جداً والأسعار منافسة مقارنة بالسوق، وتسهيلات طلبات الجملة عبر المنصة ممتازة وسريعة.' },
                    { name: 'سوبرماركت الفصول الأربعة (أبو رمانة)', feedback: 'بضاعة وكالات أصلية 100% مع فواتير نظامية وتوصيل في الموعد المحدد دائماً. نوصي بالتعامل معهم بشدة.' }
                ];

                return sampleProducts.map((p, idx) => {
                    const prof = profiles[idx % profiles.length];
                    const img = p.images ? p.images.split(',')[0].trim() : '/placeholder.svg';
                    return {
                        id: `rev-fallback-${idx}`,
                        name: prof.name,
                        feedback: prof.feedback,
                        rating: 5,
                        image: img,
                        productNameAr: p.nameAr || p.name,
                        productNameEn: p.nameEn || p.name,
                        productSlug: p.slug
                    };
                });
            }

            return reviews.map(r => ({
                id: r.id,
                name: r.name,
                feedback: r.feedback || '',
                rating: r.rating,
                image: r.product?.images ? r.product.images.split(',')[0].trim() : (r.image || '/placeholder.svg'),
                productNameAr: r.product?.nameAr || r.product?.name || '',
                productNameEn: r.product?.nameEn || r.product?.name || '',
                productSlug: r.product?.slug || ''
            }));
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
            return [];
        }
    },
    ["approved-reviews-v5"],
    { tags: ["reviews", "products"], revalidate: 3600 }
);

export const getFeaturedCategories = unstable_cache(
    async () => {
        try {
            const categories = await prisma.category.findMany({
                where: {
                    isFeatured: true,
                    brand: { isActive: true },
                },
                take: 12,
                orderBy: { updatedAt: 'desc' },
                include: {
                    brand: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        }
                    },
                    products: {
                        where: {
                            NOT: [
                                { images: '/placeholder.svg' },
                                { images: '' }
                            ]
                        },
                        take: 1,
                        select: { images: true }
                    }
                }
            });
            return categories.map(category => {
                const prodImg = category.products[0]?.images ? category.products[0].images.split(',')[0].trim() : '/logo.png';
                const bundleImg = getCategoryBundleImage(category.name, category.slug);
                const finalImg = bundleImg !== '/placeholder.svg'
                    ? bundleImg
                    : (category.image && category.image !== '/placeholder.svg' ? category.image : prodImg);
                return {
                    id: category.id,
                    name: category.name,
                    nameEn: category.description || category.name,
                    description: category.description,
                    image: finalImg,
                    slug: category.slug,
                    brandId: category.brandId,
                    isFeatured: category.isFeatured,
                    brand: category.brand ? {
                        id: category.brand.id,
                        name: category.brand.name.split('-')[0].trim(),
                        slug: category.brand.slug,
                    } : null,
                    createdAt: category.createdAt.toISOString(),
                    updatedAt: category.updatedAt.toISOString(),
                };
            });
        } catch (error) {
            console.error("Failed to fetch featured categories:", error);
            return [];
        }
    },
    ["featured-categories"],
    { tags: ["categories", "catalog"], revalidate: 3600 }
);

export const getOnSaleProducts = unstable_cache(
    async () => {
        try {
            const products = await prisma.product.findMany({
                where: {
                    archivedAt: null,
                    brand: { isActive: true, archivedAt: null },
                    discountPrice: {
                        not: null
                    }
                },
                take: 10,
                include: { category: true, brand: true },
                orderBy: { updatedAt: 'desc' }
            });

            return products.map(product => ({
                ...product,
                price: null,
                discountPrice: null,
                discountType: null,
                discountValue: null,
                stock: Number(product.stock),
                createdAt: product.createdAt.toISOString(),
                updatedAt: product.updatedAt.toISOString(),
                category: product.category ? {
                    ...product.category,
                    createdAt: product.category.createdAt.toISOString(),
                    updatedAt: product.category.updatedAt.toISOString(),
                } : null,
                brand: product.brand ? {
                    id: product.brand.id,
                    name: product.brand.name,
                    slug: product.brand.slug,
                    group: product.brand.group,
                } : null,
            }));
        } catch (error) {
            console.error("Failed to fetch on sale products:", error);
            return [];
        }
    },
    ["on-sale-products"],
    { tags: ["products", "catalog"], revalidate: 3600 }
);

export const getMainCategoryBrands = unstable_cache(
    async (): Promise<HomeBrand[]> => {
        try {
            return await prisma.brand.findMany({
                where: {
                    group: BrandGroup.MAIN,
                    isActive: true,
                    archivedAt: null,
                },
                take: 4,
                orderBy: [
                    { name: 'asc' },
                ],
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    image: true,
                    group: true,
                    _count: {
                        select: {
                            products: true,
                            categories: true,
                        },
                    },
                },
            });
        } catch (error) {
            console.error("Failed to fetch main category brands:", error);
            return [];
        }
    },
    ["main-category-brands"],
    { tags: ["brands", "main-categories"], revalidate: 3600 }
);

export const getBestSellerProducts = unstable_cache(
    async () => {
        try {
            const products = await prisma.product.findMany({
                where: {
                    isTrending: true,
                    archivedAt: null,
                    brand: { isActive: true, archivedAt: null },
                    stock: { gt: 0 },
                    price: { gte: 0 },
                    NOT: [
                        { images: '/placeholder.svg' },
                        { images: '' }
                    ],
                },
                take: 10,
                include: { category: true, brand: true },
                orderBy: { updatedAt: 'desc' }
            });

            return products.map(product => ({
                ...product,
                price: null,
                discountPrice: null,
                discountType: null,
                discountValue: null,
                stock: Number(product.stock),
                createdAt: product.createdAt.toISOString(),
                updatedAt: product.updatedAt.toISOString(),
                category: product.category ? {
                    ...product.category,
                    createdAt: product.category.createdAt.toISOString(),
                    updatedAt: product.category.updatedAt.toISOString(),
                } : null,
                brand: product.brand ? {
                    id: product.brand.id,
                    name: product.brand.name,
                    slug: product.brand.slug,
                    group: product.brand.group,
                } : null,
            }));
        } catch (error) {
            console.error("Failed to fetch best seller products:", error);
            return [];
        }
    },
    ["bestseller-products"],
    { tags: ["products", "catalog"], revalidate: 3600 }
);

export const getNewArrivalProducts = unstable_cache(
    async () => {
        try {
            const products = await prisma.product.findMany({
                where: {
                    archivedAt: null,
                    brand: { isActive: true, archivedAt: null },
                    stock: { gt: 0 },
                    price: { gte: 0 },
                    NOT: [
                        { images: '/placeholder.svg' },
                        { images: '' }
                    ],
                },
                take: 10,
                include: { category: true, brand: true },
                orderBy: { createdAt: 'desc' }
            });

            return products.map(product => ({
                ...product,
                price: null,
                discountPrice: null,
                discountType: null,
                discountValue: null,
                stock: Number(product.stock),
                createdAt: product.createdAt.toISOString(),
                updatedAt: product.updatedAt.toISOString(),
                category: product.category ? {
                    ...product.category,
                    createdAt: product.category.createdAt.toISOString(),
                    updatedAt: product.category.updatedAt.toISOString(),
                } : null,
                brand: product.brand ? {
                    id: product.brand.id,
                    name: product.brand.name,
                    slug: product.brand.slug,
                    group: product.brand.group,
                } : null,
            }));
        } catch (error) {
            console.error("Failed to fetch new arrival products:", error);
            return [];
        }
    },
    ["new-arrival-products"],
    { tags: ["products", "catalog"], revalidate: 3600 }
);

export const getTrendingWeeklyProducts = unstable_cache(
    async () => {
        try {
            const products = await prisma.product.findMany({
                where: {
                    archivedAt: null,
                    brand: { isActive: true, archivedAt: null },
                    stock: { gt: 0 },
                    price: { gte: 0 },
                    NOT: [
                        { images: '/placeholder.svg' },
                        { images: '' }
                    ],
                },
                take: 9,
                include: { category: true, brand: true },
                orderBy: [
                    { isTrending: 'desc' },
                    { updatedAt: 'desc' },
                ]
            });

            return products.map(product => ({
                ...product,
                price: null,
                discountPrice: null,
                discountType: null,
                discountValue: null,
                stock: Number(product.stock),
                createdAt: product.createdAt.toISOString(),
                updatedAt: product.updatedAt.toISOString(),
                category: product.category ? {
                    ...product.category,
                    createdAt: product.category.createdAt.toISOString(),
                    updatedAt: product.category.updatedAt.toISOString(),
                } : null,
                brand: product.brand ? {
                    id: product.brand.id,
                    name: product.brand.name,
                    slug: product.brand.slug,
                    group: product.brand.group,
                } : null,
            }));
        } catch (error) {
            console.error("Failed to fetch trending products:", error);
            return [];
        }
    },
    ["trending-weekly-products"],
    { tags: ["products", "catalog"], revalidate: 3600 }
);

export const getActiveBanners = unstable_cache(
    async () => {
        try {
            const banners = await prisma.banner.findMany({
                where: {
                    isActive: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return banners.map(banner => ({
                ...banner,
                createdAt: banner.createdAt.toISOString(),
                updatedAt: banner.updatedAt.toISOString(),
            }));
        } catch (error) {
            console.error("Failed to fetch active banners:", error);
            return [];
        }
    },
    ["active-banners-v2"],
    { tags: ["banners"], revalidate: 3600 }
);

export const getSiteSettings = unstable_cache(
    async () => {
        try {
            const settings = await prisma.settings.findUnique({
                where: { id: "site-settings" }
            });
            
            if (!settings) {
                return DEFAULT_SITE_SETTINGS;
            }
            
            return {
                ...DEFAULT_SITE_SETTINGS,
                ...settings,
                whatsappNumber: settings.whatsappNumber || CONTACT_CONFIG.salesWhatsApp,
                exchangeRate: Number(settings.exchangeRate || 135),
                statDeliveries: settings.statDeliveries || "+9000",
                statBrands: settings.statBrands || "+100",
                statProducts: settings.statProducts || "+500",
                statClients: settings.statClients || "+300",
            };
        } catch (error) {
            console.error("Failed to fetch site settings, using fallback default settings:", error);
            return DEFAULT_SITE_SETTINGS;
        }
    },
    ["site-settings-v2"],
    { tags: ["settings"], revalidate: 3600 }
);
