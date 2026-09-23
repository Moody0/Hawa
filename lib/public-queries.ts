import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BrandGroup } from "@prisma/client";
import { CONTACT_CONFIG } from "@/lib/site-config";
import { getCategoryBundleImage } from "@/lib/category-images";

export interface RailBrand {
    id: string;
    name: string;
    nameEn?: string | null;
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
    nameEn?: string | null;
    slug: string;
    description: string | null;
    image: string | null;
    group: BrandGroup;
    _count?: {
        products: number;
        categories: number;
    };
}

export interface CompanyServiceItem {
    id: string;
    icon: string;
    title: string;
    titleAr: string;
    desc: string;
    descAr: string;
    tag: string;
    tagAr: string;
    footerText: string;
    footerTextAr: string;
    link?: string;
    accent?: string;
    isFeatured?: boolean;
    isActive?: boolean;
}

export const DEFAULT_COMPANY_SERVICES: CompanyServiceItem[] = [
    {
        id: "srv-support",
        icon: "Headphones",
        title: "Customer Support",
        titleAr: "دعم العملاء",
        desc: "Dedicated wholesale support team ready to assist your store orders.",
        descAr: "فريق متخصص للرد على استفساراتكم ومساعدتكم وتسهيل طلبيات الجملة دورياً.",
        tag: "Fast Response",
        tagAr: "استجابة سريعة",
        footerText: "Verified Service",
        footerTextAr: "خدمة معتمدة",
        accent: "blue",
        isFeatured: false,
        isActive: true,
    },
    {
        id: "srv-quality",
        icon: "ShieldCheck",
        title: "Quality & Reliability",
        titleAr: "الجودة والموثوقية",
        desc: "100% authentic wholesale products conforming to global industry standards.",
        descAr: "منتجات أصلية 100% مطابقة لأعلى المعايير والمواصفات القياسية مباشرة من مصادرها.",
        tag: "Guaranteed Authentic",
        tagAr: "أصالة مضمونة",
        footerText: "Verified Service",
        footerTextAr: "خدمة معتمدة",
        accent: "gold",
        isFeatured: false,
        isActive: true,
    },
    {
        id: "srv-marketing",
        icon: "Megaphone",
        title: "Trade Marketing",
        titleAr: "التسويق التجاري",
        desc: "Commercial advertising, retail expansion, and point-of-sale acceleration.",
        descAr: "دعم العلامات التجارية بالإعلان والانتشار والمبيعات وتعزيز حضورها في نقاط البيع.",
        tag: "Market Presence",
        tagAr: "بناء حضور",
        footerText: "Verified Service",
        footerTextAr: "خدمة معتمدة",
        accent: "amber",
        isFeatured: false,
        isActive: true,
    },
    {
        id: "srv-inventory",
        icon: "Warehouse",
        title: "Inventory Management",
        titleAr: "إدارة المخزون",
        desc: "Temperature-controlled logistics warehouses and advanced inventory tracking.",
        descAr: "أنظمة متطورة لإدارة المستودعات والتخزين وفق اشتراطات الحرارة والسلامة الغذائية.",
        tag: "Safe Storage",
        tagAr: "تخزين معياري",
        footerText: "Verified Service",
        footerTextAr: "خدمة معتمدة",
        accent: "purple",
        isFeatured: false,
        isActive: true,
    },
    {
        id: "srv-distribution",
        icon: "Truck",
        title: "Professional Distribution",
        titleAr: "توزيع احترافي",
        desc: "Equipped delivery vehicles covering stores with scheduled, dependable delivery.",
        descAr: "شبكة توزيع واسعة وسيارات مجهزة تغطي مختلف المناطق والأسواق بدقة ومواعيد منتظمة.",
        tag: "Equipped Delivery",
        tagAr: "سيارات مجهزة",
        footerText: "Verified distribution service",
        footerTextAr: "خدمة توزيع معتمدة",
        accent: "featured",
        isFeatured: true,
        isActive: true,
    },
];

export interface PublicTestimonialItem {
    id: string;
    name: string;
    feedback: string;
    rating: number;
    image?: string;
    productNameAr?: string;
    productNameEn?: string;
    productSlug?: string;
}

export const DEFAULT_TESTIMONIALS: PublicTestimonialItem[] = [
    {
        id: 'rev-1',
        name: 'سوبرماركت الشام الحديث (دمشق - كفرسوسة)',
        feedback: 'أفضل موزع معتمد لوكالات زوان والريف. سرعة استثنائية في تلبية طلبيات الطرود وتأكيد مباشر وسلس عبر واتساب وبضاعة مضمونة.',
        rating: 5,
        image: 'https://i.postimg.cc/mgc4nXNC/data-bodour-2026-09-01T134612-915.png',
        productNameAr: 'زوان لانشون دجاج 200 غرام',
        productNameEn: 'Zwan Chicken Luncheon Meat 200g',
        productSlug: 'zwan-chicken-luncheon-meat-200g',
    },
    {
        id: 'rev-2',
        name: 'ميني ماركت الهدى (المزة)',
        feedback: 'التوريد منتظم جداً ومواصفات التعبئة واضحة بالطرود، مما يسهل جرد وتوزيع البضائع في المحل بدقة وبدون أي نقص.',
        rating: 5,
        image: 'https://i.postimg.cc/dQfzpfGv/data-bodour-(42).png',
        productNameAr: 'حليبنا سمن بقري 1 كيلو',
        productNameEn: 'Halibuna Ghee Clarified Butter 1kg',
        productSlug: 'halibuna-made-with-ghee-clarified-butter-1-kg',
    },
    {
        id: 'rev-3',
        name: 'بقالة البركة التجارية (مشروع دمر)',
        feedback: 'توفير كبرى الوكالات بطلب واحد وفر علينا وقتاً كبيراً في التواصل واللوجستيات مع الموزعين المتفرقين.',
        rating: 5,
        image: 'https://i.postimg.cc/N0ftBHFq/data-bodour-(43).png',
        productNameAr: 'صن بل كورند بيف 240 جرام',
        productNameEn: 'Sunbell Corned Beef 240g',
        productSlug: 'sun-bull-corned-beef-240g',
    },
    {
        id: 'rev-4',
        name: 'سوبرماركت الواحة (القصاع)',
        feedback: 'تواريخ الصلاحية حديثة جداً والتخزين المبرد يضمن وصول المنتجات بأفضل جودة لباب المحل دون أي تلف.',
        rating: 5,
        image: 'https://i.postimg.cc/X7zdwfMd/data-bodour-(44).png',
        productNameAr: 'سيلفر فيش تونا خفيف 160 جرام',
        productNameEn: 'Silver Fish Light Tuna 160g',
        productSlug: 'silver-fish-light-tuna-160g',
    },
    {
        id: 'rev-5',
        name: 'مطعم ومقهى ديلايت (المالكي)',
        feedback: 'اعتمادنا على شركة حوا في توريد الزيوت والمعلبات وفر لنا استقراراً كبيراً في الجودة وثبات الأسعار التنافسية.',
        rating: 5,
        image: 'https://i.postimg.cc/gjtXJT65/nskht-mn-nskht-mn-dwn-ʿnwan-2026-08-11T183631-628.png',
        productNameAr: 'الريف زيت دوار الشمس حجم 1 لتر',
        productNameEn: 'Al-Reef Sunflower Oil 1L',
        productSlug: 'al-reef-sunflower-oil-liter-size',
    },
    {
        id: 'rev-6',
        name: 'ماركت المدينة المنورة (التجارة)',
        feedback: 'خدمة التوصيل المباشر لباب السوبرماركت ممتازة، والشاحنات مجهزة ومبردة لنقل البضائع بأمان تام.',
        rating: 5,
        image: 'https://i.postimg.cc/yNQDHBVN/data-bodour-(45).png',
        productNameAr: 'المغربي معلبات سمك السردين بالزيت 125 جرام',
        productNameEn: 'Al-Maghrabi Canned Sardines 125g',
        productSlug: 'moroccan-canned-sardines-in-vegetable-oil-and-chili-peppers-125g',
    },
    {
        id: 'rev-7',
        name: 'بقالة النجوم (الميدان)',
        feedback: 'المعاملة راقية جداً والأسعار منافسة، وتسهيلات طلبات الجملة عبر المنصة ممتازة وسريعة.',
        rating: 5,
        image: 'https://i.postimg.cc/sDzdmf1M/data-bodour-2026-09-01T140727-827.png',
        productNameAr: 'حليبنا قهوة سريعة التحضير بحجم 80 غراماً',
        productNameEn: 'Halibuna Instant Coffee 80g',
        productSlug: 'halibuna-instant-coffee-80-grams',
    },
    {
        id: 'rev-8',
        name: 'سوبرماركت الفصول الأربعة (أبو رمانة)',
        feedback: 'بضاعة وكالات أصلية 100% مع فواتير نظامية وتوصيل في الموعد المحدد دائماً. نوصي بالتعامل معهم بشدة.',
        rating: 5,
        image: 'https://i.postimg.cc/7hqfkLF5/data-bodour-2026-09-01T140919-561.png',
        productNameAr: 'حليبنا جبنة كريمية 240 جرام',
        productNameEn: 'Halibuna Cream Cheese 240g',
        productSlug: 'halibuna-cream-cheese-240g',
    }
];

export const DEFAULT_SITE_SETTINGS = {
    id: "site-settings",
    shippingPolicyContent: null,
    contactPageContent: null,
    privacyPolicyContent: null,
    categoriesCtaTitle: "Looking for specific wholesale brands?",
    categoriesCtaDesc: "Our wholesale team is ready to provide custom pricing and scheduled deliveries for your business.",
    categoriesCtaTitleAr: "تبحث عن شركات أو منتجات محددة؟",
    categoriesCtaDescAr: "فريق المبيعات لدينا جاهز لتزويدكم بأفضل أسعار الجملة وجداول التوزيع المنتظمة.",
    categoriesCtaImage: "/uploads/banners/hawa-food-agencies-banner.jpg",
    footerBrandTitle: "Hawa Distribution",
    footerBrandTitleAr: "حوا للتوزيع والتجارة",
    footerBrandTagline: "Wholesale Distribution — Syria",
    footerBrandTaglineAr: "توزيع وتجارة جملة — سورية",
    footerBrandDescription: "Your trusted partner in wholesale food and consumer goods distribution from top brands.",
    footerBrandDescriptionAr: "شريككم الموثوق لتوزيع البضائع والمواد الغذائية والاستهلاكية من أفضل الشركات.",
    footerCopyright: "© 2026 Hawa Distribution & Trading. All rights reserved.",
    footerCopyrightAr: "© 2026 حوا للتوزيع والتجارة. جميع الحقوق محفوظة.",
    footerContactTitle: "Contact Us",
    footerContactTitleAr: "تواصل معنا",
    footerAddress: "Homs Industrial Zone, Syria",
    footerAddressAr: "حمص، المنطقة الصناعية — سورية",
    footerPhone: "+963 993 443 901",
    footerEmail: "info@hawa-dist.com",
    footerInstagramUrl: "#",
    footerFacebookUrl: "#",
    footerWhatsappUrl: "#",
    footerLinkedinUrl: "#",
    whatsappNumber: CONTACT_CONFIG.salesWhatsApp,
    footerShopTitle: "Shop",
    footerShopTitleAr: "المتجر",
    footerSupportTitle: "Our Services",
    footerSupportTitleAr: "خدماتنا",
    footerCompanyTitle: "Quick Links",
    footerCompanyTitleAr: "روابط سريعة",
    footerNewsletterTitle: "Newsletter",
    footerNewsletterTitleAr: "النشرة البريدية",
    footerNewsletterDesc: "Subscribe to get the latest trade discounts, new arrivals & price lists.",
    footerNewsletterDescAr: "اشترك ليصلك كل جديد عن المنتجات والعروض والأسعار.",
    footerJurisdiction: "Syrian Arab Republic — Homs",
    footerJurisdictionAr: "الجمهورية العربية السورية — حمص",
    footerTermsUrl: "/shipping-returns",
    footerPrivacyUrl: "/shipping-returns",
    footerSupportLink1Label: "Nationwide Freight & Delivery",
    footerSupportLink1LabelAr: "الشحن والتوصيل للمحافظات",
    footerSupportLink1Url: "/shipping-returns",
    footerSupportLink2Label: "Market Rates & Trade Blog",
    footerSupportLink2LabelAr: "نشرة الأسعار والمدونة",
    footerSupportLink2Url: "/blog",
    footerSupportLink3Label: "Agency Partnership Inquiry",
    footerSupportLink3LabelAr: "طلب تمثيل وكالة تجارية",
    footerSupportLink3Url: "/contact",
    footerSupportLink4Label: "Merchant Accounts Hub",
    footerSupportLink4LabelAr: "بوابة حسابات التجار",
    footerSupportLink4Url: "/account/login",
    footerCompanyLink1Label: "Home",
    footerCompanyLink1LabelAr: "الرئيسية",
    footerCompanyLink1Url: "/",
    footerCompanyLink2Label: "About Us",
    footerCompanyLink2LabelAr: "من نحن",
    footerCompanyLink2Url: "/about-us",
    footerCompanyLink3Label: "Official Brands",
    footerCompanyLink3LabelAr: "الوكالات والعلامات",
    footerCompanyLink3Url: "/brands",
    footerCompanyLink4Label: "Product Categories",
    footerCompanyLink4LabelAr: "أقسام المنتجات",
    footerCompanyLink4Url: "/categories",
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

    homeCategoriesBadge: "Shop by category",
    homeCategoriesBadgeAr: "تسوق حسب القسم",
    homeCategoriesTitle: "Browse Key Wholesale Categories",
    homeCategoriesTitleAr: "تصفح تشكيلة واسعة من الأصناف والمجموعات",
    homeCategoriesDesc: "Comprehensive supply for supermarkets and grocery stores in one order",
    homeCategoriesDescAr: "توفير شامل لكافة احتياجات السوبرماركت ومحلات البقالة بطلب واحد",
    homeCategoriesStats: JSON.stringify([
        {
            value: '500+',
            valueEn: '500+',
            amount: 500,
            suffixAr: '+',
            suffixEn: '+',
            labelAr: 'صنف متوفر بالمستودعات',
            labelEn: 'Wholesale SKUs',
        },
        {
            value: '8+',
            valueEn: '8+',
            amount: 8,
            suffixAr: '+',
            suffixEn: '+',
            labelAr: 'وكالات تجارية حصرية',
            labelEn: 'Exclusive Agencies',
        },
        {
            value: '48 ساعة',
            valueEn: '48h',
            amount: 48,
            suffixAr: ' ساعة',
            suffixEn: 'h',
            labelAr: 'أقصى مدة للتفريغ والتسليم',
            labelEn: 'Max Delivery SLA',
        },
        {
            value: '1,500+',
            valueEn: '1.5K+',
            amount: 1500,
            suffixAr: '+',
            suffixEn: '+',
            labelAr: 'متجر وبقالية معتمدة',
            labelEn: 'Active Retail Stores',
        },
    ]),
    homeCategoriesIds: null,
    
    homeFeaturedBadge: "Hawa Selections",
    homeFeaturedBadgeAr: "مختارات حوا",
    homeFeaturedTitle: "Featured Wholesale Products",
    homeFeaturedTitleAr: "تشكيلة منتجات الجملة الأكثر طلباً",
    homeFeaturedDesc: "Curated wholesale selection of leading brand goods at direct trade prices",
    homeFeaturedDescAr: "تشكيلة مختارة من أفضل أصناف الوكالات المعتمدة ومواد الاستهلاك بأسعار الجملة المباشرة",
    homeFeaturedBestSellerIds: null,
    homeFeaturedNewArrivalIds: null,

    homeServicesEnabled: true,
    homeServicesTitle: "Our Comprehensive Distribution Services",
    homeServicesTitleAr: "خدمات التوزيع والتجارة المتكاملة",
    homeServicesDesc: "Delivering end-to-end supply chain, marketing, and distribution solutions for FMCG brands",
    homeServicesDescAr: "نقدم للشركات المنتجة وأصحاب المحلات منظومة متكاملة تشمل التخزين والتسويق والتوصيل",
    homeServicesItems: JSON.stringify(DEFAULT_COMPANY_SERVICES),

    homeTrendingWeeklyEnabled: true,
    homeTrendingWeeklyBadge: "Market demand",
    homeTrendingWeeklyBadgeAr: "طلب السوق",
    homeTrendingWeeklyTitle: "Fast-Moving Weekly Products",
    homeTrendingWeeklyTitleAr: "المنتجات الأكثر طلباً هذا الأسبوع",
    homeTrendingWeeklyDesc: "Highest volume FMCG demands ordered by merchants this week",
    homeTrendingWeeklyDescAr: "الأصناف الأكثر حركة وسحباً من قبل المحلات والسوبرماركت بأسعار تفضيلية",
    homeTrendingWeeklyProductIds: null,

    homeTestimonialsEnabled: true,
    homeTestimonialsBadge: "Verified Endorsements",
    homeTestimonialsBadgeAr: "آراء شركائنا",
    homeTestimonialsTitle: "Verified Wholesale Buyer Reviews",
    homeTestimonialsTitleAr: "ثقة أصحاب المحلات والسوبرماركت",
    homeTestimonialsDesc: "Endorsements from verified retail merchants and grocery partners across Syria",
    homeTestimonialsDescAr: "آراء وتجارب شركائنا من تجار التجزئة وأصحاب البقاليات في مختلف المحافظات",
    homeTestimonialsItems: JSON.stringify(DEFAULT_TESTIMONIALS),

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
                    nameEn: true,
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
                const legacyParts = b.name.split(/\s+[–—-]\s+/).map((part) => part.trim()).filter(Boolean);
                const legacyEnglish = legacyParts.find((part) => /[A-Za-z]/.test(part));
                const legacyArabic = legacyParts.find((part) => /[\u0600-\u06FF]/.test(part));
                const productImg = b.products[0]?.images ? b.products[0].images.split(',')[0].trim() : null;
                return {
                    id: b.id,
                    name: b.name,
                    nameEn: b.nameEn?.trim() || legacyEnglish || null,
                    nameAr: legacyArabic || b.name,
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
                        select: { name: true, nameEn: true }
                    }
                }
            });
            return topMainCats.map(mc => {
                const firstProd = mc.products[0];
                const brandNamesAr = mc.brands.map(b => b.name).join(' & ');
                const brandNamesEn = mc.brands.map(b => b.nameEn?.trim() || b.name).join(' & ');
                const prodImg = firstProd?.images ? firstProd.images.split(',')[0].trim() : (mc.image || '');
                return {
                    id: mc.id,
                    slug: mc.slug,
                    subheadingAr: mc.name,
                    subheadingEn: mc.description || mc.name,
                    headingAr: brandNamesAr || mc.name,
                    headingEn: brandNamesEn || mc.description || mc.name,
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
            const settings = await prisma.settings.findUnique({
                where: { id: "site-settings" },
                select: {
                    homeTestimonialsEnabled: true,
                    homeTestimonialsItems: true,
                }
            });

            if (settings?.homeTestimonialsEnabled === false) {
                return [];
            }

            if (settings?.homeTestimonialsItems) {
                try {
                    const parsed = JSON.parse(settings.homeTestimonialsItems);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed as PublicTestimonialItem[];
                    }
                } catch {}
            }

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
                return DEFAULT_TESTIMONIALS;
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
            return DEFAULT_TESTIMONIALS;
        }
    },
    ["approved-reviews-v6"],
    { tags: ["reviews", "products", "settings"], revalidate: 3600 }
);

export interface PublicFeaturedCategory {
    id: string;
    name: string;
    nameEn: string;
    description: string | null;
    image: string;
    slug: string;
    href?: string;
    type?: 'category' | 'main-category';
    brandId?: string;
    isFeatured?: boolean;
    brand?: {
        id: string;
        name: string;
        nameEn?: string | null;
        slug: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}

export const getFeaturedCategories = unstable_cache(
    async (): Promise<PublicFeaturedCategory[]> => {
        try {
            const settings = await prisma.settings.findUnique({
                where: { id: "site-settings" },
                select: { homeCategoriesIds: true }
            });

            let customIds: string[] = [];
            if (settings?.homeCategoriesIds) {
                try {
                    const parsed = JSON.parse(settings.homeCategoriesIds);
                    if (Array.isArray(parsed)) {
                        customIds = parsed.filter(Boolean);
                    }
                } catch {
                    customIds = settings.homeCategoriesIds.split(',').map(s => s.trim()).filter(Boolean);
                }
            }

            if (customIds.length > 0) {
                // Fetch both sub-categories and main categories that match custom IDs
                const [fetchedSubCats, fetchedMainCats] = await Promise.all([
                    prisma.category.findMany({
                        where: {
                            id: { in: customIds },
                            isActive: true,
                            archivedAt: null,
                            brand: { isActive: true, archivedAt: null },
                        },
                        include: {
                            brand: {
                                select: {
                                    id: true,
                                    name: true,
                                    nameEn: true,
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
                    }),
                    prisma.mainCategory.findMany({
                        where: {
                            id: { in: customIds },
                            archivedAt: null,
                        },
                        include: {
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
                    })
                ]);

                // Map items preserving the admin's exact chosen custom sequence
                const itemsMap = new Map<string, PublicFeaturedCategory>();

                for (const cat of fetchedSubCats) {
                    const prodImg = cat.products[0]?.images ? cat.products[0].images.split(',')[0].trim() : '/logo.png';
                    const bundleImg = getCategoryBundleImage(cat.name, cat.slug);
                    const finalImg = (cat.image && cat.image !== '/placeholder.svg')
                        ? cat.image
                        : (bundleImg !== '/placeholder.svg' ? bundleImg : prodImg);

                    itemsMap.set(cat.id, {
                        id: cat.id,
                        name: cat.name,
                        nameEn: cat.description || cat.name,
                        description: cat.description,
                        image: finalImg,
                        slug: cat.slug,
                        href: `/products?category=${encodeURIComponent(cat.slug)}`,
                        type: 'category',
                        brandId: cat.brandId,
                        isFeatured: cat.isFeatured,
                        brand: cat.brand ? {
                            id: cat.brand.id,
                            name: cat.brand.name,
                            nameEn: cat.brand.nameEn,
                            slug: cat.brand.slug,
                        } : null,
                        createdAt: cat.createdAt.toISOString(),
                        updatedAt: cat.updatedAt.toISOString(),
                    });
                }

                for (const mc of fetchedMainCats) {
                    const prodImg = mc.products[0]?.images ? mc.products[0].images.split(',')[0].trim() : '/logo.png';
                    const bundleImg = getCategoryBundleImage(mc.name, mc.slug);
                    const finalImg = (mc.image && mc.image !== '/placeholder.svg')
                        ? mc.image
                        : (bundleImg !== '/placeholder.svg' ? bundleImg : prodImg);

                    itemsMap.set(mc.id, {
                        id: mc.id,
                        name: mc.name,
                        nameEn: mc.description || mc.name,
                        description: mc.description,
                        image: finalImg,
                        slug: mc.slug,
                        href: `/department/${encodeURIComponent(mc.slug)}`,
                        type: 'main-category',
                        isFeatured: mc.isFeatured,
                        brand: null,
                        createdAt: mc.createdAt.toISOString(),
                        updatedAt: mc.updatedAt.toISOString(),
                    });
                }

                return customIds
                    .map(id => itemsMap.get(id))
                    .filter((item): item is PublicFeaturedCategory => Boolean(item));
            }

            // Auto mode: fetch featured MainCategories (Departments) + featured Categories (Sub-categories)
            const [mainCats, subCats] = await Promise.all([
                prisma.mainCategory.findMany({
                    where: {
                        isFeatured: true,
                        isActive: true,
                        archivedAt: null,
                    },
                    orderBy: { navOrder: 'asc' },
                    include: {
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
                }),
                prisma.category.findMany({
                    where: {
                        isFeatured: true,
                        isActive: true,
                        brand: { isActive: true },
                        archivedAt: null,
                    },
                    take: 16,
                    orderBy: { updatedAt: 'desc' },
                    include: {
                        brand: {
                            select: {
                                id: true,
                                name: true,
                                nameEn: true,
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
                })
            ]);

            const mappedMainCats: PublicFeaturedCategory[] = mainCats.map(mc => {
                const prodImg = mc.products[0]?.images ? mc.products[0].images.split(',')[0].trim() : '/logo.png';
                const bundleImg = getCategoryBundleImage(mc.name, mc.slug);
                const finalImg = (mc.image && mc.image !== '/placeholder.svg')
                    ? mc.image
                    : (bundleImg !== '/placeholder.svg' ? bundleImg : prodImg);

                return {
                    id: mc.id,
                    name: mc.name,
                    nameEn: mc.description || mc.name,
                    description: mc.description,
                    image: finalImg,
                    slug: mc.slug,
                    href: `/department/${encodeURIComponent(mc.slug)}`,
                    type: 'main-category',
                    isFeatured: mc.isFeatured,
                    brand: null,
                    createdAt: mc.createdAt.toISOString(),
                    updatedAt: mc.updatedAt.toISOString(),
                };
            });

            const mappedSubCats: PublicFeaturedCategory[] = subCats.map(cat => {
                const prodImg = cat.products[0]?.images ? cat.products[0].images.split(',')[0].trim() : '/logo.png';
                const bundleImg = getCategoryBundleImage(cat.name, cat.slug);
                const finalImg = (cat.image && cat.image !== '/placeholder.svg')
                    ? cat.image
                    : (bundleImg !== '/placeholder.svg' ? bundleImg : prodImg);

                return {
                    id: cat.id,
                    name: cat.name,
                    nameEn: cat.description || cat.name,
                    description: cat.description,
                    image: finalImg,
                    slug: cat.slug,
                    href: `/products?category=${encodeURIComponent(cat.slug)}`,
                    type: 'category',
                    brandId: cat.brandId,
                    isFeatured: cat.isFeatured,
                    brand: cat.brand ? {
                        id: cat.brand.id,
                        name: cat.brand.name,
                        nameEn: cat.brand.nameEn,
                        slug: cat.brand.slug,
                    } : null,
                    createdAt: cat.createdAt.toISOString(),
                    updatedAt: cat.updatedAt.toISOString(),
                };
            });

            // Put featured main categories at the front, followed by featured sub-categories,
            // while deduplicating identical concepts across brands (e.g. multiple 'معلبات' from different brands)
            const allItems = [...mappedMainCats, ...mappedSubCats];
            const seenKeys = new Set<string>();
            const deduplicated: PublicFeaturedCategory[] = [];

            const normalizeKey = (name: string) => {
                return name
                    .replace(/وال/g, 'و')
                    .replace(/^ال/g, '')
                    .replace(/[\s\-_]+/g, '')
                    .toLowerCase()
                    .trim();
            };

            for (const item of allItems) {
                if (!item.name || item.name.trim() === 'عام') continue;
                const key = normalizeKey(item.name);
                if (!seenKeys.has(key)) {
                    seenKeys.add(key);
                    deduplicated.push(item);
                }
            }

            return deduplicated;
        } catch (error) {
            console.error("Failed to fetch featured categories:", error);
            return [];
        }
    },
    ["featured-categories-v4"],
    { tags: ["categories", "catalog", "settings", "main-categories"], revalidate: 3600 }
);

export const getOnSaleProducts = unstable_cache(
    async () => {
        try {
            const products = await prisma.product.findMany({
                where: {
                    archivedAt: null,
                    brand: { isActive: true, archivedAt: null },
                    category: { isActive: true, archivedAt: null },
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
                    nameEn: product.brand.nameEn,
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
                    nameEn: true,
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
            const settings = await prisma.settings.findUnique({
                where: { id: "site-settings" },
                select: { homeFeaturedBestSellerIds: true },
            });
            let customIds: string[] = [];
            if (settings?.homeFeaturedBestSellerIds) {
                try {
                    const parsed = JSON.parse(settings.homeFeaturedBestSellerIds);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        customIds = parsed;
                    }
                } catch {}
            }

            let products;
            if (customIds.length > 0) {
                const fetched = await prisma.product.findMany({
                    where: {
                        id: { in: customIds },
                        archivedAt: null,
                        brand: { isActive: true, archivedAt: null },
                        category: { isActive: true, archivedAt: null },
                    },
                    include: { category: true, brand: true },
                });
                products = customIds
                    .map(id => fetched.find(p => p.id === id))
                    .filter((p): p is NonNullable<typeof p> => Boolean(p));
            } else {
                products = await prisma.product.findMany({
                    where: {
                        isTrending: true,
                        archivedAt: null,
                        brand: { isActive: true, archivedAt: null },
                        category: { isActive: true, archivedAt: null },
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
            }

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
                    nameEn: product.brand.nameEn,
                    slug: product.brand.slug,
                    group: product.brand.group,
                } : null,
            }));
        } catch (error) {
            console.error("Failed to fetch best seller products:", error);
            return [];
        }
    },
    ["bestseller-products-v2"],
    { tags: ["products", "catalog", "settings"], revalidate: 3600 }
);

export const getNewArrivalProducts = unstable_cache(
    async () => {
        try {
            const settings = await prisma.settings.findUnique({
                where: { id: "site-settings" },
                select: { homeFeaturedNewArrivalIds: true },
            });
            let customIds: string[] = [];
            if (settings?.homeFeaturedNewArrivalIds) {
                try {
                    const parsed = JSON.parse(settings.homeFeaturedNewArrivalIds);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        customIds = parsed;
                    }
                } catch {}
            }

            let products;
            if (customIds.length > 0) {
                const fetched = await prisma.product.findMany({
                    where: {
                        id: { in: customIds },
                        archivedAt: null,
                        brand: { isActive: true, archivedAt: null },
                        category: { isActive: true, archivedAt: null },
                    },
                    include: { category: true, brand: true },
                });
                products = customIds
                    .map(id => fetched.find(p => p.id === id))
                    .filter((p): p is NonNullable<typeof p> => Boolean(p));
            } else {
                products = await prisma.product.findMany({
                    where: {
                        archivedAt: null,
                        brand: { isActive: true, archivedAt: null },
                        category: { isActive: true, archivedAt: null },
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
            }

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
                    nameEn: product.brand.nameEn,
                    slug: product.brand.slug,
                    group: product.brand.group,
                } : null,
            }));
        } catch (error) {
            console.error("Failed to fetch new arrival products:", error);
            return [];
        }
    },
    ["new-arrival-products-v2"],
    { tags: ["products", "catalog", "settings"], revalidate: 3600 }
);

export const getTrendingWeeklyProducts = unstable_cache(
    async () => {
        try {
            const settings = await prisma.settings.findUnique({
                where: { id: "site-settings" },
                select: {
                    homeTrendingWeeklyProductIds: true,
                    homeTrendingWeeklyEnabled: true,
                },
            });

            if (settings?.homeTrendingWeeklyEnabled === false) {
                return [];
            }

            let customIds: string[] = [];
            if (settings?.homeTrendingWeeklyProductIds) {
                try {
                    const parsed = JSON.parse(settings.homeTrendingWeeklyProductIds);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        customIds = parsed;
                    }
                } catch {}
            }

            let products;
            if (customIds.length > 0) {
                const fetched = await prisma.product.findMany({
                    where: {
                        id: { in: customIds },
                        archivedAt: null,
                        brand: { isActive: true, archivedAt: null },
                        category: { isActive: true, archivedAt: null },
                    },
                    include: { category: true, brand: true },
                });
                products = customIds
                    .map(id => fetched.find(p => p.id === id))
                    .filter((p): p is NonNullable<typeof p> => Boolean(p));
            } else {
                products = await prisma.product.findMany({
                    where: {
                        archivedAt: null,
                        brand: { isActive: true, archivedAt: null },
                        category: { isActive: true, archivedAt: null },
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
            }

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
                    nameEn: product.brand.nameEn,
                    slug: product.brand.slug,
                    group: product.brand.group,
                } : null,
            }));
        } catch (error) {
            console.error("Failed to fetch trending products:", error);
            return [];
        }
    },
    ["trending-weekly-products-v3"],
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

            let privacyPolicyContent = (settings as any)?.privacyPolicyContent || null;
            if (!privacyPolicyContent) {
                try {
                    const rawRows: any = await prisma.$queryRawUnsafe(`SELECT "privacyPolicyContent" FROM "Settings" WHERE id = 'site-settings' LIMIT 1`);
                    if (rawRows?.[0]?.privacyPolicyContent) {
                        privacyPolicyContent = rawRows[0].privacyPolicyContent;
                    }
                } catch {
                    // Safe fallback if column is not yet queried
                }
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
                homeCategoriesBadge: settings.homeCategoriesBadge || DEFAULT_SITE_SETTINGS.homeCategoriesBadge,
                homeCategoriesBadgeAr: settings.homeCategoriesBadgeAr || DEFAULT_SITE_SETTINGS.homeCategoriesBadgeAr,
                homeCategoriesTitle: settings.homeCategoriesTitle || DEFAULT_SITE_SETTINGS.homeCategoriesTitle,
                homeCategoriesTitleAr: settings.homeCategoriesTitleAr || DEFAULT_SITE_SETTINGS.homeCategoriesTitleAr,
                homeCategoriesDesc: settings.homeCategoriesDesc || DEFAULT_SITE_SETTINGS.homeCategoriesDesc,
                homeCategoriesDescAr: settings.homeCategoriesDescAr || DEFAULT_SITE_SETTINGS.homeCategoriesDescAr,
                homeCategoriesStats: settings.homeCategoriesStats || DEFAULT_SITE_SETTINGS.homeCategoriesStats,
                homeCategoriesIds: settings.homeCategoriesIds || null,
                homeFeaturedBadge: settings.homeFeaturedBadge || DEFAULT_SITE_SETTINGS.homeFeaturedBadge,
                homeFeaturedBadgeAr: settings.homeFeaturedBadgeAr || DEFAULT_SITE_SETTINGS.homeFeaturedBadgeAr,
                homeFeaturedTitle: settings.homeFeaturedTitle || DEFAULT_SITE_SETTINGS.homeFeaturedTitle,
                homeFeaturedTitleAr: settings.homeFeaturedTitleAr || DEFAULT_SITE_SETTINGS.homeFeaturedTitleAr,
                homeFeaturedDesc: settings.homeFeaturedDesc || DEFAULT_SITE_SETTINGS.homeFeaturedDesc,
                homeFeaturedDescAr: settings.homeFeaturedDescAr || DEFAULT_SITE_SETTINGS.homeFeaturedDescAr,
                homeFeaturedBestSellerIds: settings.homeFeaturedBestSellerIds || null,
                homeFeaturedNewArrivalIds: settings.homeFeaturedNewArrivalIds || null,
                homeServicesEnabled: settings.homeServicesEnabled !== null && settings.homeServicesEnabled !== undefined ? settings.homeServicesEnabled : true,
                homeServicesTitle: settings.homeServicesTitle || DEFAULT_SITE_SETTINGS.homeServicesTitle,
                homeServicesTitleAr: settings.homeServicesTitleAr || DEFAULT_SITE_SETTINGS.homeServicesTitleAr,
                homeServicesDesc: settings.homeServicesDesc || DEFAULT_SITE_SETTINGS.homeServicesDesc,
                homeServicesDescAr: settings.homeServicesDescAr || DEFAULT_SITE_SETTINGS.homeServicesDescAr,
                homeServicesItems: settings.homeServicesItems || DEFAULT_SITE_SETTINGS.homeServicesItems,
                homeTrendingWeeklyEnabled: settings.homeTrendingWeeklyEnabled !== null && settings.homeTrendingWeeklyEnabled !== undefined ? settings.homeTrendingWeeklyEnabled : true,
                homeTrendingWeeklyBadge: settings.homeTrendingWeeklyBadge || DEFAULT_SITE_SETTINGS.homeTrendingWeeklyBadge,
                homeTrendingWeeklyBadgeAr: settings.homeTrendingWeeklyBadgeAr || DEFAULT_SITE_SETTINGS.homeTrendingWeeklyBadgeAr,
                homeTrendingWeeklyTitle: settings.homeTrendingWeeklyTitle || DEFAULT_SITE_SETTINGS.homeTrendingWeeklyTitle,
                homeTrendingWeeklyTitleAr: settings.homeTrendingWeeklyTitleAr || DEFAULT_SITE_SETTINGS.homeTrendingWeeklyTitleAr,
                homeTrendingWeeklyDesc: settings.homeTrendingWeeklyDesc || DEFAULT_SITE_SETTINGS.homeTrendingWeeklyDesc,
                homeTrendingWeeklyDescAr: settings.homeTrendingWeeklyDescAr || DEFAULT_SITE_SETTINGS.homeTrendingWeeklyDescAr,
                homeTrendingWeeklyProductIds: settings.homeTrendingWeeklyProductIds || null,
                homeTestimonialsEnabled: settings.homeTestimonialsEnabled !== null && settings.homeTestimonialsEnabled !== undefined ? settings.homeTestimonialsEnabled : true,
                homeTestimonialsBadge: settings.homeTestimonialsBadge || DEFAULT_SITE_SETTINGS.homeTestimonialsBadge,
                homeTestimonialsBadgeAr: settings.homeTestimonialsBadgeAr || DEFAULT_SITE_SETTINGS.homeTestimonialsBadgeAr,
                homeTestimonialsTitle: settings.homeTestimonialsTitle || DEFAULT_SITE_SETTINGS.homeTestimonialsTitle,
                homeTestimonialsTitleAr: settings.homeTestimonialsTitleAr || DEFAULT_SITE_SETTINGS.homeTestimonialsTitleAr,
                homeTestimonialsDesc: settings.homeTestimonialsDesc || DEFAULT_SITE_SETTINGS.homeTestimonialsDesc,
                homeTestimonialsDescAr: settings.homeTestimonialsDescAr || DEFAULT_SITE_SETTINGS.homeTestimonialsDescAr,
                homeTestimonialsItems: settings.homeTestimonialsItems || DEFAULT_SITE_SETTINGS.homeTestimonialsItems,
                shippingPolicyContent: (settings as any)?.shippingPolicyContent || null,
                contactPageContent: (settings as any)?.contactPageContent || null,
                privacyPolicyContent: privacyPolicyContent,

                // Footer settings with defaults
                footerBrandTitle: settings.footerBrandTitle || DEFAULT_SITE_SETTINGS.footerBrandTitle,
                footerBrandTitleAr: settings.footerBrandTitleAr || DEFAULT_SITE_SETTINGS.footerBrandTitleAr,
                footerBrandTagline: settings.footerBrandTagline || DEFAULT_SITE_SETTINGS.footerBrandTagline,
                footerBrandTaglineAr: settings.footerBrandTaglineAr || DEFAULT_SITE_SETTINGS.footerBrandTaglineAr,
                footerBrandDescription: settings.footerBrandDescription || DEFAULT_SITE_SETTINGS.footerBrandDescription,
                footerBrandDescriptionAr: settings.footerBrandDescriptionAr || DEFAULT_SITE_SETTINGS.footerBrandDescriptionAr,
                footerCopyright: settings.footerCopyright || DEFAULT_SITE_SETTINGS.footerCopyright,
                footerCopyrightAr: settings.footerCopyrightAr || DEFAULT_SITE_SETTINGS.footerCopyrightAr,
                footerContactTitle: settings.footerContactTitle || DEFAULT_SITE_SETTINGS.footerContactTitle,
                footerContactTitleAr: settings.footerContactTitleAr || DEFAULT_SITE_SETTINGS.footerContactTitleAr,
                footerAddress: settings.footerAddress || DEFAULT_SITE_SETTINGS.footerAddress,
                footerAddressAr: settings.footerAddressAr || DEFAULT_SITE_SETTINGS.footerAddressAr,
                footerPhone: settings.footerPhone || DEFAULT_SITE_SETTINGS.footerPhone,
                footerEmail: settings.footerEmail || DEFAULT_SITE_SETTINGS.footerEmail,
                footerInstagramUrl: settings.footerInstagramUrl || DEFAULT_SITE_SETTINGS.footerInstagramUrl,
                footerFacebookUrl: settings.footerFacebookUrl || DEFAULT_SITE_SETTINGS.footerFacebookUrl,
                footerWhatsappUrl: settings.footerWhatsappUrl || DEFAULT_SITE_SETTINGS.footerWhatsappUrl,
                footerLinkedinUrl: settings.footerLinkedinUrl || DEFAULT_SITE_SETTINGS.footerLinkedinUrl,
                footerShopTitle: settings.footerShopTitle || DEFAULT_SITE_SETTINGS.footerShopTitle,
                footerShopTitleAr: settings.footerShopTitleAr || DEFAULT_SITE_SETTINGS.footerShopTitleAr,
                footerSupportTitle: settings.footerSupportTitle || DEFAULT_SITE_SETTINGS.footerSupportTitle,
                footerSupportTitleAr: settings.footerSupportTitleAr || DEFAULT_SITE_SETTINGS.footerSupportTitleAr,
                footerCompanyTitle: settings.footerCompanyTitle || DEFAULT_SITE_SETTINGS.footerCompanyTitle,
                footerCompanyTitleAr: settings.footerCompanyTitleAr || DEFAULT_SITE_SETTINGS.footerCompanyTitleAr,
                footerNewsletterTitle: settings.footerNewsletterTitle || DEFAULT_SITE_SETTINGS.footerNewsletterTitle,
                footerNewsletterTitleAr: settings.footerNewsletterTitleAr || DEFAULT_SITE_SETTINGS.footerNewsletterTitleAr,
                footerNewsletterDesc: settings.footerNewsletterDesc || DEFAULT_SITE_SETTINGS.footerNewsletterDesc,
                footerNewsletterDescAr: settings.footerNewsletterDescAr || DEFAULT_SITE_SETTINGS.footerNewsletterDescAr,
                footerJurisdiction: settings.footerJurisdiction || DEFAULT_SITE_SETTINGS.footerJurisdiction,
                footerJurisdictionAr: settings.footerJurisdictionAr || DEFAULT_SITE_SETTINGS.footerJurisdictionAr,
                footerTermsUrl: settings.footerTermsUrl || DEFAULT_SITE_SETTINGS.footerTermsUrl,
                footerPrivacyUrl: settings.footerPrivacyUrl || DEFAULT_SITE_SETTINGS.footerPrivacyUrl,
                footerSupportLink1Label: settings.footerSupportLink1Label || DEFAULT_SITE_SETTINGS.footerSupportLink1Label,
                footerSupportLink1LabelAr: settings.footerSupportLink1LabelAr || DEFAULT_SITE_SETTINGS.footerSupportLink1LabelAr,
                footerSupportLink1Url: settings.footerSupportLink1Url || DEFAULT_SITE_SETTINGS.footerSupportLink1Url,
                footerSupportLink2Label: settings.footerSupportLink2Label || DEFAULT_SITE_SETTINGS.footerSupportLink2Label,
                footerSupportLink2LabelAr: settings.footerSupportLink2LabelAr || DEFAULT_SITE_SETTINGS.footerSupportLink2LabelAr,
                footerSupportLink2Url: settings.footerSupportLink2Url || DEFAULT_SITE_SETTINGS.footerSupportLink2Url,
                footerSupportLink3Label: settings.footerSupportLink3Label || DEFAULT_SITE_SETTINGS.footerSupportLink3Label,
                footerSupportLink3LabelAr: settings.footerSupportLink3LabelAr || DEFAULT_SITE_SETTINGS.footerSupportLink3LabelAr,
                footerSupportLink3Url: settings.footerSupportLink3Url || DEFAULT_SITE_SETTINGS.footerSupportLink3Url,
                footerSupportLink4Label: settings.footerSupportLink4Label || DEFAULT_SITE_SETTINGS.footerSupportLink4Label,
                footerSupportLink4LabelAr: settings.footerSupportLink4LabelAr || DEFAULT_SITE_SETTINGS.footerSupportLink4LabelAr,
                footerSupportLink4Url: settings.footerSupportLink4Url || DEFAULT_SITE_SETTINGS.footerSupportLink4Url,
                footerCompanyLink1Label: settings.footerCompanyLink1Label || DEFAULT_SITE_SETTINGS.footerCompanyLink1Label,
                footerCompanyLink1LabelAr: settings.footerCompanyLink1LabelAr || DEFAULT_SITE_SETTINGS.footerCompanyLink1LabelAr,
                footerCompanyLink1Url: settings.footerCompanyLink1Url || DEFAULT_SITE_SETTINGS.footerCompanyLink1Url,
                footerCompanyLink2Label: settings.footerCompanyLink2Label || DEFAULT_SITE_SETTINGS.footerCompanyLink2Label,
                footerCompanyLink2LabelAr: settings.footerCompanyLink2LabelAr || DEFAULT_SITE_SETTINGS.footerCompanyLink2LabelAr,
                footerCompanyLink2Url: settings.footerCompanyLink2Url || DEFAULT_SITE_SETTINGS.footerCompanyLink2Url,
                footerCompanyLink3Label: settings.footerCompanyLink3Label || DEFAULT_SITE_SETTINGS.footerCompanyLink3Label,
                footerCompanyLink3LabelAr: settings.footerCompanyLink3LabelAr || DEFAULT_SITE_SETTINGS.footerCompanyLink3LabelAr,
                footerCompanyLink3Url: settings.footerCompanyLink3Url || DEFAULT_SITE_SETTINGS.footerCompanyLink3Url,
                footerCompanyLink4Label: settings.footerCompanyLink4Label || DEFAULT_SITE_SETTINGS.footerCompanyLink4Label,
                footerCompanyLink4LabelAr: settings.footerCompanyLink4LabelAr || DEFAULT_SITE_SETTINGS.footerCompanyLink4LabelAr,
                footerCompanyLink4Url: settings.footerCompanyLink4Url || DEFAULT_SITE_SETTINGS.footerCompanyLink4Url,
            };
        } catch (error) {
            console.error("Failed to fetch site settings, using fallback default settings:", error);
            return DEFAULT_SITE_SETTINGS;
        }
    },
    ["site-settings-v4"],
    { tags: ["settings"], revalidate: 3600 }
);
