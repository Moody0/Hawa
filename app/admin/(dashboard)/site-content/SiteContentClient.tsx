"use client";

import { useState, useMemo, useEffect } from "react";
import { Image, Clock, Truck, AlertTriangle, ShieldCheck, Info, Save, Store, TrendingUp, RefreshCw, GalleryHorizontal, FolderTree, Sparkles, Phone, Flame, MessageSquareQuote } from 'lucide-react';
import AdminHeader from "../../components/AdminHeader";
import { useAdminSidebar } from "../../context/AdminSidebarContext";
import { updateSiteSettings } from "../../../../lib/admin-actions";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/app/context/LanguageContext";
import FooterContentSection from "./FooterContentSection";
import HomeCategoriesContentSection, { CategoryOption, StatMetricItem, DEFAULT_STATS } from "./HomeCategoriesContentSection";
import HomeFeaturedContentSection, { ProductOption } from "./HomeFeaturedContentSection";
import HomeTrendingContentSection from "./HomeTrendingContentSection";
import HomeServicesContentSection from "./HomeServicesContentSection";
import HomeTestimonialsContentSection from "./HomeTestimonialsContentSection";
import ShippingPolicyEditor from "./ShippingPolicyEditor";
import ContactContentSection from "./ContactContentSection";
import PrivacyPolicyEditor from "./PrivacyPolicyEditor";
import { getShippingPolicyContent, ShippingPolicyContent } from "@/lib/shipping-policy-content";
import { getContactPageContent, ContactPageContent } from "@/lib/contact-page-content";
import { getPrivacyPolicyContent, PrivacyPolicyContent } from "@/lib/privacy-policy-content";
import { CompanyServiceItem, DEFAULT_COMPANY_SERVICES, PublicTestimonialItem, DEFAULT_TESTIMONIALS } from "@/lib/public-queries";

interface SiteSettings {
    id: string;
    shippingPolicyContent?: unknown;
    contactPageContent?: unknown;
    privacyPolicyContent?: unknown;
    categoriesCtaTitle: string | null;
    categoriesCtaDesc: string | null;
    categoriesCtaTitleAr: string | null;
    categoriesCtaDescAr: string | null;
    categoriesCtaImage: string | null;
    footerBrandTitle: string | null;
    footerBrandTitleAr: string | null;
    footerBrandTagline: string | null;
    footerBrandTaglineAr: string | null;
    footerBrandDescription: string | null;
    footerBrandDescriptionAr: string | null;
    footerCopyright: string | null;
    footerCopyrightAr: string | null;
    footerContactTitle: string | null;
    footerContactTitleAr: string | null;
    footerAddress: string | null;
    footerAddressAr: string | null;
    footerPhone: string | null;
    footerEmail: string | null;
    footerInstagramUrl: string | null;
    footerFacebookUrl: string | null;
    footerWhatsappUrl: string | null;
    footerLinkedinUrl: string | null;
    whatsappNumber: string | null;
    footerShopTitle: string | null;
    footerShopTitleAr: string | null;
    footerSupportTitle: string | null;
    footerSupportTitleAr: string | null;
    footerCompanyTitle: string | null;
    footerCompanyTitleAr: string | null;
    footerNewsletterTitle: string | null;
    footerNewsletterTitleAr: string | null;
    footerNewsletterDesc: string | null;
    footerNewsletterDescAr: string | null;
    footerJurisdiction: string | null;
    footerJurisdictionAr: string | null;
    footerTermsUrl: string | null;
    footerPrivacyUrl: string | null;
    footerSupportLink1Label: string | null;
    footerSupportLink1LabelAr: string | null;
    footerSupportLink1Url: string | null;
    footerSupportLink2Label: string | null;
    footerSupportLink2LabelAr: string | null;
    footerSupportLink2Url: string | null;
    footerSupportLink3Label: string | null;
    footerSupportLink3LabelAr: string | null;
    footerSupportLink3Url: string | null;
    footerSupportLink4Label: string | null;
    footerSupportLink4LabelAr: string | null;
    footerSupportLink4Url: string | null;
    footerCompanyLink1Label: string | null;
    footerCompanyLink1LabelAr: string | null;
    footerCompanyLink1Url: string | null;
    footerCompanyLink2Label: string | null;
    footerCompanyLink2LabelAr: string | null;
    footerCompanyLink2Url: string | null;
    footerCompanyLink3Label: string | null;
    footerCompanyLink3LabelAr: string | null;
    footerCompanyLink3Url: string | null;
    footerCompanyLink4Label: string | null;
    footerCompanyLink4LabelAr: string | null;
    footerCompanyLink4Url: string | null;
    footerCategory1Id: string | null;
    footerCategory2Id: string | null;
    footerCategory3Id: string | null;
    footerCategory4Id: string | null;
    shippingTitle: string | null;
    shippingDesc: string | null;
    shippingTitleAr: string | null;
    shippingDescAr: string | null;
    verificationTitle: string | null;
    verificationDesc: string | null;
    verificationTitleAr: string | null;
    verificationDescAr: string | null;
    standardShippingTime: string | null;
    expressShippingTime: string | null;
    returnsTitle: string | null;
    returnsDesc: string | null;
    returnsTitleAr: string | null;
    returnsDescAr: string | null;
    finalSaleTitle: string | null;
    finalSaleDesc: string | null;
    finalSaleTitleAr: string | null;
    finalSaleDescAr: string | null;
    hygieneTitle: string | null;
    hygieneDesc: string | null;
    hygieneTitleAr: string | null;
    hygieneDescAr: string | null;
    shippingReturnsImage: string | null;
    aboutHeroTitle: string | null;
    aboutHeroTitleAr: string | null;
    aboutHeroSubtitle: string | null;
    aboutHeroSubtitleAr: string | null;
    aboutHeroImage: string | null;
    aboutNarrativeTitle: string | null;
    aboutNarrativeTitleAr: string | null;
    aboutNarrativeFounded: string | null;
    aboutNarrativeFoundedAr: string | null;
    aboutNarrativeDesc1: string | null;
    aboutNarrativeDesc1Ar: string | null;
    aboutNarrativeDesc2: string | null;
    aboutNarrativeDesc2Ar: string | null;
    aboutNarrativeQuote: string | null;
    aboutNarrativeQuoteAr: string | null;
    aboutNarrativeImage: string | null;
    aboutValuesTitle: string | null;
    aboutValuesTitleAr: string | null;
    aboutValuesDesc: string | null;
    aboutValuesDescAr: string | null;
    aboutValue1Title: string | null;
    aboutValue1TitleAr: string | null;
    aboutValue1Desc: string | null;
    aboutValue1DescAr: string | null;
    aboutValue2Title: string | null;
    aboutValue2TitleAr: string | null;
    aboutValue2Desc: string | null;
    aboutValue2DescAr: string | null;
    aboutValue3Title: string | null;
    aboutValue3TitleAr: string | null;
    aboutValue3Desc: string | null;
    aboutValue3DescAr: string | null;
    exchangeRate: number | null;
    middleBanner1Image: string | null;
    middleBanner1Link: string | null;
    middleBanner2Image: string | null;
    middleBanner2Link: string | null;
    middleBanner2Title: string | null;
    middleBanner2TitleAr: string | null;
    middleBanner2Subtitle: string | null;
    middleBanner2SubtitleAr: string | null;
    middleBanner2ButtonText: string | null;
    middleBanner2ButtonTextAr: string | null;
    statDeliveries?: string | null;
    statBrands?: string | null;
    statProducts?: string | null;
    statClients?: string | null;
    homeCategoriesBadge?: string | null;
    homeCategoriesBadgeAr?: string | null;
    homeCategoriesTitle?: string | null;
    homeCategoriesTitleAr?: string | null;
    homeCategoriesDesc?: string | null;
    homeCategoriesDescAr?: string | null;
    homeCategoriesStats?: string | null;
    homeCategoriesIds?: string | null;
    homeFeaturedBadge?: string | null;
    homeFeaturedBadgeAr?: string | null;
    homeFeaturedTitle?: string | null;
    homeFeaturedTitleAr?: string | null;
    homeFeaturedDesc?: string | null;
    homeFeaturedDescAr?: string | null;
    homeFeaturedBestSellerIds?: string | null;
    homeFeaturedNewArrivalIds?: string | null;
    homeTrendingWeeklyEnabled?: boolean | null;
    homeTrendingWeeklyBadge?: string | null;
    homeTrendingWeeklyBadgeAr?: string | null;
    homeTrendingWeeklyTitle?: string | null;
    homeTrendingWeeklyTitleAr?: string | null;
    homeTrendingWeeklyDesc?: string | null;
    homeTrendingWeeklyDescAr?: string | null;
    homeTrendingWeeklyProductIds?: string | null;
    homeServicesEnabled?: boolean | null;
    homeServicesTitle?: string | null;
    homeServicesTitleAr?: string | null;
    homeServicesDesc?: string | null;
    homeServicesDescAr?: string | null;
    homeServicesItems?: string | null;
    homeTestimonialsEnabled?: boolean | null;
    homeTestimonialsBadge?: string | null;
    homeTestimonialsBadgeAr?: string | null;
    homeTestimonialsTitle?: string | null;
    homeTestimonialsTitleAr?: string | null;
    homeTestimonialsDesc?: string | null;
    homeTestimonialsDescAr?: string | null;
    homeTestimonialsItems?: string | null;
}

type TabType = "currency" | "homeCategories" | "homeFeatured" | "homeTrending" | "homeServices" | "homeTestimonials" | "stats" | "footer" | "banners" | "shipping" | "about" | "contact" | "privacy";

export default function SiteContentClient({ 
    initialSettings,
    categories,
    products = [],
}: { 
    initialSettings: SiteSettings | null;
    categories: CategoryOption[];
    products?: ProductOption[];
}) {
    const { t, dir, language } = useLanguage();
    const { openSidebar } = useAdminSidebar();
    const [activeTab, setActiveTab] = useState<TabType>("currency");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get("tab") as TabType | null;
            const validTabs: TabType[] = [
                "currency", "homeCategories", "homeFeatured", "homeTrending", 
                "homeServices", "homeTestimonials", "stats", "footer", 
                "banners", "shipping", "contact", "privacy", "about"
            ];
            if (tab && validTabs.includes(tab)) {
                setActiveTab(tab);
            }
        }
    }, []);

    const handleTabChange = (newTab: TabType) => {
        setActiveTab(newTab);
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("tab", newTab);
            window.history.replaceState({}, "", url.toString());
        }
    };

    // Site Settings State - Home Categories & Wholesale Stats
    const [homeCategoriesBadge, setHomeCategoriesBadge] = useState(initialSettings?.homeCategoriesBadge || "DIRECT WHOLESALE DISTRIBUTION");
    const [homeCategoriesBadgeAr, setHomeCategoriesBadgeAr] = useState(initialSettings?.homeCategoriesBadgeAr || "توزيع جملة مباشر ومستودعات مركزية");
    const [homeCategoriesTitle, setHomeCategoriesTitle] = useState(initialSettings?.homeCategoriesTitle || "Browse Key Wholesale Categories");
    const [homeCategoriesTitleAr, setHomeCategoriesTitleAr] = useState(initialSettings?.homeCategoriesTitleAr || "تصفح تشكيلة واسعة من الأصناف والمجموعات");
    const [homeCategoriesDesc, setHomeCategoriesDesc] = useState(initialSettings?.homeCategoriesDesc || "Reliable inventory across food supplies, premium oils, detergents, and baby care essentials with direct depot dispatch.");
    const [homeCategoriesDescAr, setHomeCategoriesDescAr] = useState(initialSettings?.homeCategoriesDescAr || "نوفر لمتاجرك ومستودعاتك أفضل السلع الأساسية والمواد الاستهلاكية بأسعار جملة منافسة وجاهزية فورية للتسليم.");

    const [homeStats, setHomeStats] = useState<StatMetricItem[]>(() => {
        if (!initialSettings?.homeCategoriesStats) return DEFAULT_STATS;
        try {
            const parsed = JSON.parse(initialSettings.homeCategoriesStats);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_STATS;
        } catch {
            return DEFAULT_STATS;
        }
    });

    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(() => {
        if (!initialSettings?.homeCategoriesIds) return [];
        try {
            const parsed = JSON.parse(initialSettings.homeCategoriesIds);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    // Site Settings State - Home Featured Wholesale Products
    const [homeFeaturedBadge, setHomeFeaturedBadge] = useState(initialSettings?.homeFeaturedBadge || "Hawa Selections");
    const [homeFeaturedBadgeAr, setHomeFeaturedBadgeAr] = useState(initialSettings?.homeFeaturedBadgeAr || "مختارات حوا");
    const [homeFeaturedTitle, setHomeFeaturedTitle] = useState(initialSettings?.homeFeaturedTitle || "Featured Wholesale Products");
    const [homeFeaturedTitleAr, setHomeFeaturedTitleAr] = useState(initialSettings?.homeFeaturedTitleAr || "تشكيلة منتجات الجملة الأكثر طلباً");
    const [homeFeaturedDesc, setHomeFeaturedDesc] = useState(initialSettings?.homeFeaturedDesc || "Curated wholesale selection across leading agencies and essentials at direct trade prices");
    const [homeFeaturedDescAr, setHomeFeaturedDescAr] = useState(initialSettings?.homeFeaturedDescAr || "تشكيلة مختارة من أفضل أصناف الوكالات المعتمدة ومواد الاستهلاك بأسعار الجملة المباشرة");

    const [homeFeaturedBestSellerIds, setHomeFeaturedBestSellerIds] = useState<string[]>(() => {
        if (!initialSettings?.homeFeaturedBestSellerIds) return [];
        try {
            const parsed = JSON.parse(initialSettings.homeFeaturedBestSellerIds);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    const [homeFeaturedNewArrivalIds, setHomeFeaturedNewArrivalIds] = useState<string[]>(() => {
        if (!initialSettings?.homeFeaturedNewArrivalIds) return [];
        try {
            const parsed = JSON.parse(initialSettings.homeFeaturedNewArrivalIds);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    // Site Settings State - Home Trending Weekly FMCG Products
    const [homeTrendingWeeklyEnabled, setHomeTrendingWeeklyEnabled] = useState<boolean>(initialSettings?.homeTrendingWeeklyEnabled !== false);
    const [homeTrendingWeeklyBadge, setHomeTrendingWeeklyBadge] = useState(initialSettings?.homeTrendingWeeklyBadge || "TOP FMCG MOVERS");
    const [homeTrendingWeeklyBadgeAr, setHomeTrendingWeeklyBadgeAr] = useState(initialSettings?.homeTrendingWeeklyBadgeAr || "أعلى السلع حركة وطلباً");
    const [homeTrendingWeeklyTitle, setHomeTrendingWeeklyTitle] = useState(initialSettings?.homeTrendingWeeklyTitle || "Fast-Moving Weekly Products");
    const [homeTrendingWeeklyTitleAr, setHomeTrendingWeeklyTitleAr] = useState(initialSettings?.homeTrendingWeeklyTitleAr || "المنتجات الأكثر طلباً هذا الأسبوع");
    const [homeTrendingWeeklyDesc, setHomeTrendingWeeklyDesc] = useState(initialSettings?.homeTrendingWeeklyDesc || "High-velocity wholesale consumables with rapid warehouse turnaround and daily pallet dispatch.");
    const [homeTrendingWeeklyDescAr, setHomeTrendingWeeklyDescAr] = useState(initialSettings?.homeTrendingWeeklyDescAr || "المواد الأكثر طلباً وسحباً في الأسواق السورية — جاهزية مستمرة للطلبيات التجارية الكبيرة وشحن فوري.");

    const [homeTrendingWeeklyProductIds, setHomeTrendingWeeklyProductIds] = useState<string[]>(() => {
        if (!initialSettings?.homeTrendingWeeklyProductIds) return [];
        try {
            const parsed = JSON.parse(initialSettings.homeTrendingWeeklyProductIds);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    // Site Settings State - Company Capabilities & Services
    const [homeServicesEnabled, setHomeServicesEnabled] = useState<boolean>(initialSettings?.homeServicesEnabled !== false);
    const [homeServicesTitle, setHomeServicesTitle] = useState(initialSettings?.homeServicesTitle || "Our Comprehensive Distribution Services");
    const [homeServicesTitleAr, setHomeServicesTitleAr] = useState(initialSettings?.homeServicesTitleAr || "خدمات التوزيع والتجارة المتكاملة");
    const [homeServicesDesc, setHomeServicesDesc] = useState(initialSettings?.homeServicesDesc || "Delivering end-to-end supply chain, marketing, and distribution solutions for FMCG brands");
    const [homeServicesDescAr, setHomeServicesDescAr] = useState(initialSettings?.homeServicesDescAr || "نقدم للشركات المنتجة وأصحاب المحلات منظومة متكاملة تشمل التخزين والتسويق والتوصيل");

    const [homeServices, setHomeServices] = useState<CompanyServiceItem[]>(() => {
        if (!initialSettings?.homeServicesItems) return DEFAULT_COMPANY_SERVICES;
        try {
            const parsed = JSON.parse(initialSettings.homeServicesItems);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_COMPANY_SERVICES;
        } catch {
            return DEFAULT_COMPANY_SERVICES;
        }
    });

    // Site Settings State - Merchant Endorsements & Testimonials
    const [homeTestimonialsEnabled, setHomeTestimonialsEnabled] = useState<boolean>(initialSettings?.homeTestimonialsEnabled !== false);
    const [homeTestimonialsBadge, setHomeTestimonialsBadge] = useState(initialSettings?.homeTestimonialsBadge || "Verified Endorsements");
    const [homeTestimonialsBadgeAr, setHomeTestimonialsBadgeAr] = useState(initialSettings?.homeTestimonialsBadgeAr || "آراء شركائنا");
    const [homeTestimonialsTitle, setHomeTestimonialsTitle] = useState(initialSettings?.homeTestimonialsTitle || "Verified Wholesale Buyer Reviews");
    const [homeTestimonialsTitleAr, setHomeTestimonialsTitleAr] = useState(initialSettings?.homeTestimonialsTitleAr || "ثقة أصحاب المحلات والسوبرماركت");
    const [homeTestimonialsDesc, setHomeTestimonialsDesc] = useState(initialSettings?.homeTestimonialsDesc || "Endorsements from verified retail merchants and grocery partners across Syria");
    const [homeTestimonialsDescAr, setHomeTestimonialsDescAr] = useState(initialSettings?.homeTestimonialsDescAr || "آراء وتجارب شركائنا من تجار التجزئة وأصحاب البقاليات في مختلف المحافظات");

    const [homeTestimonials, setHomeTestimonials] = useState<PublicTestimonialItem[]>(() => {
        if (!initialSettings?.homeTestimonialsItems) return DEFAULT_TESTIMONIALS;
        try {
            const parsed = JSON.parse(initialSettings.homeTestimonialsItems);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TESTIMONIALS;
        } catch {
            return DEFAULT_TESTIMONIALS;
        }
    });

    // Site Settings State - B2B Wholesale Statistics
    const [statsContent, setStatsContent] = useState({
        statDeliveries: initialSettings?.statDeliveries || "+9000",
        statBrands: initialSettings?.statBrands || "+100",
        statProducts: initialSettings?.statProducts || "+500",
        statClients: initialSettings?.statClients || "+300",
    });

    // Site Settings State - Categories CTA
    const [ctaTitle, setCtaTitle] = useState(initialSettings?.categoriesCtaTitle || "");
    const [ctaDesc, setCtaDesc] = useState(initialSettings?.categoriesCtaDesc || "");
    const [ctaTitleAr, setCtaTitleAr] = useState(initialSettings?.categoriesCtaTitleAr || "");
    const [ctaDescAr, setCtaDescAr] = useState(initialSettings?.categoriesCtaDescAr || "");
    const [ctaImage, setCtaImage] = useState(initialSettings?.categoriesCtaImage || "");

    // Site Settings State - Footer Content
    const [footerContent, setFooterContent] = useState({
        footerBrandTitle: initialSettings?.footerBrandTitle || "Hawa Distribution",
        footerBrandTitleAr: initialSettings?.footerBrandTitleAr || "حوا للتوزيع والتجارة",
        footerBrandTagline: initialSettings?.footerBrandTagline || "Wholesale Distribution — Syria",
        footerBrandTaglineAr: initialSettings?.footerBrandTaglineAr || "توزيع وتجارة جملة — سورية",
        footerBrandDescription: initialSettings?.footerBrandDescription || "Your trusted partner in wholesale food and consumer goods distribution from top brands.",
        footerBrandDescriptionAr: initialSettings?.footerBrandDescriptionAr || "شريككم الموثوق لتوزيع البضائع والمواد الغذائية والاستهلاكية من أفضل الشركات.",
        footerCopyright: initialSettings?.footerCopyright || "© 2026 Hawa Distribution & Trading. All rights reserved.",
        footerCopyrightAr: initialSettings?.footerCopyrightAr || "© 2026 حوا للتوزيع والتجارة. جميع الحقوق محفوظة.",
        footerContactTitle: initialSettings?.footerContactTitle || "Contact Us",
        footerContactTitleAr: initialSettings?.footerContactTitleAr || "تواصل معنا",
        footerAddress: initialSettings?.footerAddress || "Homs Industrial Zone, Syria",
        footerAddressAr: initialSettings?.footerAddressAr || "حمص، المنطقة الصناعية — سورية",
        footerPhone: initialSettings?.footerPhone || "+963 993 443 901",
        footerEmail: initialSettings?.footerEmail || "info@hawa-dist.com",
        footerInstagramUrl: initialSettings?.footerInstagramUrl || "",
        footerFacebookUrl: initialSettings?.footerFacebookUrl || "",
        footerWhatsappUrl: initialSettings?.footerWhatsappUrl || "",
        footerLinkedinUrl: initialSettings?.footerLinkedinUrl || "",
        whatsappNumber: initialSettings?.whatsappNumber || "+963 993 443 901",
        footerShopTitle: initialSettings?.footerShopTitle || "Shop",
        footerShopTitleAr: initialSettings?.footerShopTitleAr || "المتجر",
        footerSupportTitle: initialSettings?.footerSupportTitle || "Our Services",
        footerSupportTitleAr: initialSettings?.footerSupportTitleAr || "خدماتنا",
        footerCompanyTitle: initialSettings?.footerCompanyTitle || "Quick Links",
        footerCompanyTitleAr: initialSettings?.footerCompanyTitleAr || "روابط سريعة",
        footerNewsletterTitle: initialSettings?.footerNewsletterTitle || "Newsletter",
        footerNewsletterTitleAr: initialSettings?.footerNewsletterTitleAr || "النشرة البريدية",
        footerNewsletterDesc: initialSettings?.footerNewsletterDesc || "Subscribe to get the latest trade discounts, new arrivals & price lists.",
        footerNewsletterDescAr: initialSettings?.footerNewsletterDescAr || "اشترك ليصلك كل جديد عن المنتجات والعروض والأسعار.",
        footerJurisdiction: initialSettings?.footerJurisdiction || "Syrian Arab Republic — Homs",
        footerJurisdictionAr: initialSettings?.footerJurisdictionAr || "الجمهورية العربية السورية — حمص",
        footerTermsUrl: initialSettings?.footerTermsUrl || "/shipping-returns",
        footerPrivacyUrl: initialSettings?.footerPrivacyUrl || "/shipping-returns",
        footerSupportLink1Label: initialSettings?.footerSupportLink1Label || "Nationwide Freight & Delivery",
        footerSupportLink1LabelAr: initialSettings?.footerSupportLink1LabelAr || "الشحن والتوصيل للمحافظات",
        footerSupportLink1Url: initialSettings?.footerSupportLink1Url || "/shipping-returns",
        footerSupportLink2Label: initialSettings?.footerSupportLink2Label || "Market Rates & Trade Blog",
        footerSupportLink2LabelAr: initialSettings?.footerSupportLink2LabelAr || "نشرة الأسعار والمدونة",
        footerSupportLink2Url: initialSettings?.footerSupportLink2Url || "/blog",
        footerSupportLink3Label: initialSettings?.footerSupportLink3Label || "Agency Partnership Inquiry",
        footerSupportLink3LabelAr: initialSettings?.footerSupportLink3LabelAr || "طلب تمثيل وكالة تجارية",
        footerSupportLink3Url: initialSettings?.footerSupportLink3Url || "/contact",
        footerSupportLink4Label: initialSettings?.footerSupportLink4Label || "Merchant Accounts Hub",
        footerSupportLink4LabelAr: initialSettings?.footerSupportLink4LabelAr || "بوابة حسابات التجار",
        footerSupportLink4Url: initialSettings?.footerSupportLink4Url || "/account/login",
        footerCompanyLink1Label: initialSettings?.footerCompanyLink1Label || "Home",
        footerCompanyLink1LabelAr: initialSettings?.footerCompanyLink1LabelAr || "الرئيسية",
        footerCompanyLink1Url: initialSettings?.footerCompanyLink1Url || "/",
        footerCompanyLink2Label: initialSettings?.footerCompanyLink2Label || "About Us",
        footerCompanyLink2LabelAr: initialSettings?.footerCompanyLink2LabelAr || "من نحن",
        footerCompanyLink2Url: initialSettings?.footerCompanyLink2Url || "/about-us",
        footerCompanyLink3Label: initialSettings?.footerCompanyLink3Label || "Official Brands",
        footerCompanyLink3LabelAr: initialSettings?.footerCompanyLink3LabelAr || "الوكالات والعلامات",
        footerCompanyLink3Url: initialSettings?.footerCompanyLink3Url || "/brands",
        footerCompanyLink4Label: initialSettings?.footerCompanyLink4Label || "Product Categories",
        footerCompanyLink4LabelAr: initialSettings?.footerCompanyLink4LabelAr || "أقسام المنتجات",
        footerCompanyLink4Url: initialSettings?.footerCompanyLink4Url || "/categories",
        footerCategory1Id: initialSettings?.footerCategory1Id || "",
        footerCategory2Id: initialSettings?.footerCategory2Id || "",
        footerCategory3Id: initialSettings?.footerCategory3Id || "",
        footerCategory4Id: initialSettings?.footerCategory4Id || "",
    });

    // Site Settings State - About Us
    const [aboutHeroTitle, setAboutHeroTitle] = useState(initialSettings?.aboutHeroTitle || "");
    const [aboutHeroTitleAr, setAboutHeroTitleAr] = useState(initialSettings?.aboutHeroTitleAr || "");
    const [aboutHeroSubtitle, setAboutHeroSubtitle] = useState(initialSettings?.aboutHeroSubtitle || "");
    const [aboutHeroSubtitleAr, setAboutHeroSubtitleAr] = useState(initialSettings?.aboutHeroSubtitleAr || "");
    const [aboutHeroImage, setAboutHeroImage] = useState(initialSettings?.aboutHeroImage || "");
    
    const [aboutNarrativeTitle, setAboutNarrativeTitle] = useState(initialSettings?.aboutNarrativeTitle || "");
    const [aboutNarrativeTitleAr, setAboutNarrativeTitleAr] = useState(initialSettings?.aboutNarrativeTitleAr || "");
    const [aboutNarrativeFounded, setAboutNarrativeFounded] = useState(initialSettings?.aboutNarrativeFounded || "Founded in 2024");
    const [aboutNarrativeFoundedAr, setAboutNarrativeFoundedAr] = useState(initialSettings?.aboutNarrativeFoundedAr || "تأسست في 2024");
    const [aboutNarrativeDesc1, setAboutNarrativeDesc1] = useState(initialSettings?.aboutNarrativeDesc1 || "");
    const [aboutNarrativeDesc1Ar, setAboutNarrativeDesc1Ar] = useState(initialSettings?.aboutNarrativeDesc1Ar || "");
    const [aboutNarrativeDesc2, setAboutNarrativeDesc2] = useState(initialSettings?.aboutNarrativeDesc2 || "");
    const [aboutNarrativeDesc2Ar, setAboutNarrativeDesc2Ar] = useState(initialSettings?.aboutNarrativeDesc2Ar || "");
    const [aboutNarrativeQuote, setAboutNarrativeQuote] = useState(initialSettings?.aboutNarrativeQuote || "");
    const [aboutNarrativeQuoteAr, setAboutNarrativeQuoteAr] = useState(initialSettings?.aboutNarrativeQuoteAr || "");
    const [aboutNarrativeImage, setAboutNarrativeImage] = useState(initialSettings?.aboutNarrativeImage || "");

    // Site Settings State - Shipping & Returns
    const [shippingTitle, setShippingTitle] = useState(initialSettings?.shippingTitle || "");
    const [shippingDesc, setShippingDesc] = useState(initialSettings?.shippingDesc || "");
    const [shippingTitleAr, setShippingTitleAr] = useState(initialSettings?.shippingTitleAr || "");
    const [shippingDescAr, setShippingDescAr] = useState(initialSettings?.shippingDescAr || "");

    const [verificationTitle, setVerificationTitle] = useState(initialSettings?.verificationTitle || "");
    const [verificationDesc, setVerificationDesc] = useState(initialSettings?.verificationDesc || "");
    const [verificationTitleAr, setVerificationTitleAr] = useState(initialSettings?.verificationTitleAr || "");
    const [verificationDescAr, setVerificationDescAr] = useState(initialSettings?.verificationDescAr || "");

    const [standardShippingTime, setStandardShippingTime] = useState(initialSettings?.standardShippingTime || "");
    const [expressShippingTime, setExpressShippingTime] = useState(initialSettings?.expressShippingTime || "");

    const [returnsTitle, setReturnsTitle] = useState(initialSettings?.returnsTitle || "");
    const [returnsDesc, setReturnsDesc] = useState(initialSettings?.returnsDesc || "");
    const [returnsTitleAr, setReturnsTitleAr] = useState(initialSettings?.returnsTitleAr || "");
    const [returnsDescAr, setReturnsDescAr] = useState(initialSettings?.returnsDescAr || "");

    const [finalSaleTitle, setFinalSaleTitle] = useState(initialSettings?.finalSaleTitle || "");
    const [finalSaleDesc, setFinalSaleDesc] = useState(initialSettings?.finalSaleDesc || "");
    const [finalSaleTitleAr, setFinalSaleTitleAr] = useState(initialSettings?.finalSaleTitleAr || "");
    const [finalSaleDescAr, setFinalSaleDescAr] = useState(initialSettings?.finalSaleDescAr || "");

    const [hygieneTitle, setHygieneTitle] = useState(initialSettings?.hygieneTitle || "");
    const [hygieneDesc, setHygieneDesc] = useState(initialSettings?.hygieneDesc || "");
    const [hygieneTitleAr, setHygieneTitleAr] = useState(initialSettings?.hygieneTitleAr || "");
    const [hygieneDescAr, setHygieneDescAr] = useState(initialSettings?.hygieneDescAr || "");

    const [shippingReturnsImage, setShippingReturnsImage] = useState(initialSettings?.shippingReturnsImage || "");
    const [shippingPolicyContent, setShippingPolicyContent] = useState<ShippingPolicyContent>(
        getShippingPolicyContent(initialSettings?.shippingPolicyContent, initialSettings),
    );
    const [contactPageContent, setContactPageContent] = useState<ContactPageContent>(
        getContactPageContent(initialSettings?.contactPageContent, initialSettings),
    );
    const [privacyPolicyContent, setPrivacyPolicyContent] = useState<PrivacyPolicyContent>(
        getPrivacyPolicyContent(initialSettings?.privacyPolicyContent, initialSettings),
    );

    const [exchangeRate, setExchangeRate] = useState(initialSettings?.exchangeRate || 135);

    // Middle Banner 1
    const [middleBanner1Image, setMiddleBanner1Image] = useState(initialSettings?.middleBanner1Image || "");
    const [middleBanner1Link, setMiddleBanner1Link] = useState(initialSettings?.middleBanner1Link || "");

    // Middle Banner 2
    const [middleBanner2Image, setMiddleBanner2Image] = useState(initialSettings?.middleBanner2Image || "");
    const [middleBanner2Link, setMiddleBanner2Link] = useState(initialSettings?.middleBanner2Link || "");
    const [middleBanner2Title, setMiddleBanner2Title] = useState(initialSettings?.middleBanner2Title || "");
    const [middleBanner2TitleAr, setMiddleBanner2TitleAr] = useState(initialSettings?.middleBanner2TitleAr || "");
    const [middleBanner2Subtitle, setMiddleBanner2Subtitle] = useState(initialSettings?.middleBanner2Subtitle || "");
    const [middleBanner2SubtitleAr, setMiddleBanner2SubtitleAr] = useState(initialSettings?.middleBanner2SubtitleAr || "");
    const [middleBanner2ButtonText, setMiddleBanner2ButtonText] = useState(initialSettings?.middleBanner2ButtonText || "");
    const [middleBanner2ButtonTextAr, setMiddleBanner2ButtonTextAr] = useState(initialSettings?.middleBanner2ButtonTextAr || "");

    const handleFooterFieldChange = (field: string, value: string) => {
        setFooterContent((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleSaveAll = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await updateSiteSettings({
                exchangeRate: Number(exchangeRate) || 135,
                categoriesCtaTitle: ctaTitle,
                categoriesCtaDesc: ctaDesc,
                categoriesCtaTitleAr: ctaTitleAr,
                categoriesCtaDescAr: ctaDescAr,
                categoriesCtaImage: ctaImage,
                ...footerContent,
                footerCategory1Id: footerContent.footerCategory1Id || null,
                footerCategory2Id: footerContent.footerCategory2Id || null,
                footerCategory3Id: footerContent.footerCategory3Id || null,
                footerCategory4Id: footerContent.footerCategory4Id || null,
                shippingTitle,
                shippingDesc,
                shippingTitleAr,
                shippingDescAr,
                verificationTitle,
                verificationDesc,
                verificationTitleAr,
                verificationDescAr,
                standardShippingTime,
                expressShippingTime,
                returnsTitle,
                returnsDesc,
                returnsTitleAr,
                returnsDescAr,
                finalSaleTitle,
                finalSaleDesc,
                finalSaleTitleAr,
                finalSaleDescAr,
                hygieneTitle,
                hygieneDesc,
                hygieneTitleAr,
                hygieneDescAr,
                shippingReturnsImage,
                shippingPolicyContent,
                contactPageContent,
                privacyPolicyContent,
                aboutHeroTitle,
                aboutHeroTitleAr,
                aboutHeroSubtitle,
                aboutHeroSubtitleAr,
                aboutHeroImage,
                aboutNarrativeTitle,
                aboutNarrativeTitleAr,
                aboutNarrativeFounded,
                aboutNarrativeFoundedAr,
                aboutNarrativeDesc1,
                aboutNarrativeDesc1Ar,
                aboutNarrativeDesc2,
                aboutNarrativeDesc2Ar,
                aboutNarrativeQuote,
                aboutNarrativeQuoteAr,
                aboutNarrativeImage,
                middleBanner1Image,
                middleBanner1Link,
                middleBanner2Image,
                middleBanner2Link,
                middleBanner2Title,
                middleBanner2TitleAr,
                middleBanner2Subtitle,
                middleBanner2SubtitleAr,
                middleBanner2ButtonText,
                middleBanner2ButtonTextAr,
                ...statsContent,
                homeCategoriesBadge,
                homeCategoriesBadgeAr,
                homeCategoriesTitle,
                homeCategoriesTitleAr,
                homeCategoriesDesc,
                homeCategoriesDescAr,
                homeCategoriesStats: JSON.stringify(homeStats),
                homeCategoriesIds: selectedCategoryIds.length > 0 ? JSON.stringify(selectedCategoryIds) : null,
                homeFeaturedBadge,
                homeFeaturedBadgeAr,
                homeFeaturedTitle,
                homeFeaturedTitleAr,
                homeFeaturedDesc,
                homeFeaturedDescAr,
                homeFeaturedBestSellerIds: homeFeaturedBestSellerIds.length > 0 ? JSON.stringify(homeFeaturedBestSellerIds) : null,
                homeFeaturedNewArrivalIds: homeFeaturedNewArrivalIds.length > 0 ? JSON.stringify(homeFeaturedNewArrivalIds) : null,
                homeTrendingWeeklyEnabled,
                homeTrendingWeeklyBadge,
                homeTrendingWeeklyBadgeAr,
                homeTrendingWeeklyTitle,
                homeTrendingWeeklyTitleAr,
                homeTrendingWeeklyDesc,
                homeTrendingWeeklyDescAr,
                homeTrendingWeeklyProductIds: homeTrendingWeeklyProductIds.length > 0 ? JSON.stringify(homeTrendingWeeklyProductIds) : null,
                homeServicesEnabled,
                homeServicesTitle,
                homeServicesTitleAr,
                homeServicesDesc,
                homeServicesDescAr,
                homeServicesItems: JSON.stringify(homeServices),
                homeTestimonialsEnabled,
                homeTestimonialsBadge,
                homeTestimonialsBadgeAr,
                homeTestimonialsTitle,
                homeTestimonialsTitleAr,
                homeTestimonialsDesc,
                homeTestimonialsDescAr,
                homeTestimonialsItems: JSON.stringify(homeTestimonials),
            });

            if (result.success) {
                toast.success(t('admin.settingsUpdated') || "Settings updated successfully!");
            } else {
                toast.error(result.error || t('admin.failedToUpdate') || "Failed to update settings");
            }
        } catch (error) {
            console.error("Error updating settings:", error);
            toast.error(t('admin.failedToUpdate') || "Failed to update");
        } finally {
            setIsSubmitting(false);
        }
    };

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: "currency", label: t('admin.tabCurrency') || "Currency & Rates", icon: <RefreshCw className="text-lg" /> },
        { id: "homeCategories", label: language === 'ar' ? "أقسام وإحصائيات الرئيسية" : "Home Categories & Stats", icon: <FolderTree className="text-lg" /> },
        { id: "homeFeatured", label: language === 'ar' ? "مختارات الجملة (المميزة)" : "Featured Products", icon: <Sparkles className="text-lg" /> },
        { id: "homeTrending", label: language === 'ar' ? "الأكثر طلباً هذا الأسبوع" : "Weekly Trending", icon: <Flame className="text-lg" /> },
        { id: "homeServices", label: language === 'ar' ? "خدمات ومزايا الشركة" : "Company Services", icon: <Truck className="text-lg" /> },
        { id: "homeTestimonials", label: language === 'ar' ? "آراء التجار (ثقة المحلات)" : "Merchant Reviews", icon: <MessageSquareQuote className="text-lg" /> },
        { id: "stats", label: t('admin.companyStats') || (language === 'ar' ? "إحصائيات صفحة من نحن" : "About Us Stats"), icon: <TrendingUp className="text-lg" /> },
        { id: "footer", label: t('admin.tabFooter') || "Footer & Social", icon: <Store className="text-lg" /> },
        { id: "banners", label: t('admin.tabBanners') || "Promo Banners", icon: <GalleryHorizontal className="text-lg" /> },
        { id: "shipping", label: t('admin.tabShipping') || "Shipping & Policy", icon: <Truck className="text-lg" /> },
        { id: "privacy", label: language === 'ar' ? "سياسة الخصوصية" : "Privacy Policy", icon: <ShieldCheck className="text-lg" /> },
        { id: "contact", label: language === 'ar' ? "صفحة تواصل معنا" : "Contact Us Page", icon: <Phone className="text-lg" /> },
        { id: "about", label: t('admin.tabAbout') || "About Us Story", icon: <Info className="text-lg" /> },
    ];

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#0b1120]">
            <AdminHeader title={t('admin.siteContent')} onMenuClick={openSidebar} />

            {/* Sub-Header & Sticky Action Bar */}
            <div className="bg-white dark:bg-[#0f172a] border-b border-slate-200/80 dark:border-white/10 px-6 md:px-10 py-5 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {t('admin.siteContent')}
                        </h2>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {t('admin.siteContentSubtitle') || "Customize pages, banners, policies, and store information across both languages."}
                        </p>
                    </div>

                    <button
                        onClick={() => handleSaveAll()}
                        disabled={isSubmitting}
                        className="bg-[#0B192C] hover:bg-[#1e293b] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed self-start md:self-auto"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                                <span>{t('admin.saving')}</span>
                            </>
                        ) : (
                            <>
                                <Save className="text-lg" />
                                <span>{t('admin.saveChanges')}</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Sub-Navigation Tabs */}
                <div className="max-w-6xl mx-auto mt-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                                    isActive
                                        ? 'bg-[#0B192C] text-white shadow-xs'
                                        : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                                }`}
                            >
                                <span className={isActive ? 'text-[#8A6305]' : 'text-slate-400'}>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="max-w-6xl mx-auto pb-12">
                    {/* TAB 1: CURRENCY & EXCHANGE RATES */}
                    {activeTab === "currency" && (
                        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 md:p-8 shadow-xs animate-in fade-in-50 duration-200">
                            <div className="mb-6 flex items-start gap-4">
                                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-[#8A6305] dark:text-[#8A6305] rounded-xl">
                                    <RefreshCw className="text-2xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {t('admin.currencySettings')}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        {t('admin.currencySettingsDesc')}
                                    </p>
                                </div>
                            </div>

                            <div className="max-w-md space-y-4">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {t('admin.exchangeRateLabel')} (1 USD = X SYP)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={exchangeRate}
                                        onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200/80 dark:border-white/10 rounded-xl text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0B192C] outline-none transition-all"
                                        placeholder="135"
                                        required
                                    />
                                    <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                        SYP / USD
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">
                                    {t('admin.currencyHelpText') || "All prices stored in USD will be multiplied by this rate when customer views prices in Syrian Pounds."}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* TAB: HOME CATEGORIES & STATS */}
                    {activeTab === "homeCategories" && (
                        <HomeCategoriesContentSection
                            badge={homeCategoriesBadge}
                            setBadge={setHomeCategoriesBadge}
                            badgeAr={homeCategoriesBadgeAr}
                            setBadgeAr={setHomeCategoriesBadgeAr}
                            title={homeCategoriesTitle}
                            setTitle={setHomeCategoriesTitle}
                            titleAr={homeCategoriesTitleAr}
                            setTitleAr={setHomeCategoriesTitleAr}
                            desc={homeCategoriesDesc}
                            setDesc={setHomeCategoriesDesc}
                            descAr={homeCategoriesDescAr}
                            setDescAr={setHomeCategoriesDescAr}
                            stats={homeStats}
                            setStats={setHomeStats}
                            categories={categories}
                            selectedCategoryIds={selectedCategoryIds}
                            setSelectedCategoryIds={setSelectedCategoryIds}
                            isArabic={language === 'ar'}
                            onSave={handleSaveAll}
                            isSaving={isSubmitting}
                        />
                    )}

                    {/* TAB: HOME FEATURED WHOLESALE PRODUCTS */}
                    {activeTab === "homeFeatured" && (
                        <HomeFeaturedContentSection
                            badge={homeFeaturedBadge}
                            setBadge={setHomeFeaturedBadge}
                            badgeAr={homeFeaturedBadgeAr}
                            setBadgeAr={setHomeFeaturedBadgeAr}
                            title={homeFeaturedTitle}
                            setTitle={setHomeFeaturedTitle}
                            titleAr={homeFeaturedTitleAr}
                            setTitleAr={setHomeFeaturedTitleAr}
                            desc={homeFeaturedDesc}
                            setDesc={setHomeFeaturedDesc}
                            descAr={homeFeaturedDescAr}
                            setDescAr={setHomeFeaturedDescAr}
                            bestSellerIds={homeFeaturedBestSellerIds}
                            setBestSellerIds={setHomeFeaturedBestSellerIds}
                            newArrivalIds={homeFeaturedNewArrivalIds}
                            setNewArrivalIds={setHomeFeaturedNewArrivalIds}
                            products={products}
                            isArabic={language === 'ar'}
                        />
                    )}

                    {/* TAB: HOME TRENDING WEEKLY WHOLESALE PRODUCTS */}
                    {activeTab === "homeTrending" && (
                        <HomeTrendingContentSection
                            enabled={homeTrendingWeeklyEnabled}
                            setEnabled={setHomeTrendingWeeklyEnabled}
                            badge={homeTrendingWeeklyBadge}
                            setBadge={setHomeTrendingWeeklyBadge}
                            badgeAr={homeTrendingWeeklyBadgeAr}
                            setBadgeAr={setHomeTrendingWeeklyBadgeAr}
                            title={homeTrendingWeeklyTitle}
                            setTitle={setHomeTrendingWeeklyTitle}
                            titleAr={homeTrendingWeeklyTitleAr}
                            setTitleAr={setHomeTrendingWeeklyTitleAr}
                            desc={homeTrendingWeeklyDesc}
                            setDesc={setHomeTrendingWeeklyDesc}
                            descAr={homeTrendingWeeklyDescAr}
                            setDescAr={setHomeTrendingWeeklyDescAr}
                            productIds={homeTrendingWeeklyProductIds}
                            setProductIds={setHomeTrendingWeeklyProductIds}
                            products={products}
                            isArabic={language === 'ar'}
                        />
                    )}

                    {/* TAB: HOME SERVICES & CAPABILITIES */}
                    {activeTab === "homeServices" && (
                        <HomeServicesContentSection
                            enabled={homeServicesEnabled}
                            setEnabled={setHomeServicesEnabled}
                            title={homeServicesTitle}
                            setTitle={setHomeServicesTitle}
                            titleAr={homeServicesTitleAr}
                            setTitleAr={setHomeServicesTitleAr}
                            desc={homeServicesDesc}
                            setDesc={setHomeServicesDesc}
                            descAr={homeServicesDescAr}
                            setDescAr={setHomeServicesDescAr}
                            services={homeServices}
                            setServices={setHomeServices}
                            isArabic={language === 'ar'}
                            onSave={handleSaveAll}
                            isSaving={isSubmitting}
                        />
                    )}

                    {/* TAB: MERCHANT REVIEWS & TESTIMONIALS */}
                    {activeTab === "homeTestimonials" && (
                        <HomeTestimonialsContentSection
                            enabled={homeTestimonialsEnabled}
                            setEnabled={setHomeTestimonialsEnabled}
                            badge={homeTestimonialsBadge}
                            setBadge={setHomeTestimonialsBadge}
                            badgeAr={homeTestimonialsBadgeAr}
                            setBadgeAr={setHomeTestimonialsBadgeAr}
                            title={homeTestimonialsTitle}
                            setTitle={setHomeTestimonialsTitle}
                            titleAr={homeTestimonialsTitleAr}
                            setTitleAr={setHomeTestimonialsTitleAr}
                            desc={homeTestimonialsDesc}
                            setDesc={setHomeTestimonialsDesc}
                            descAr={homeTestimonialsDescAr}
                            setDescAr={setHomeTestimonialsDescAr}
                            testimonials={homeTestimonials}
                            setTestimonials={setHomeTestimonials}
                            products={products}
                            isArabic={language === 'ar'}
                        />
                    )}

                    {/* TAB: B2B COMPANY STATISTICS */}
                    {activeTab === "stats" && (
                        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 md:p-8 shadow-xs animate-in fade-in-50 duration-200">
                            <div className="mb-6 flex items-start gap-4">
                                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-[#8A6305] dark:text-[#8A6305] rounded-xl">
                                    <TrendingUp className="text-2xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {t('admin.companyStats') || (language === 'ar' ? "إحصائيات صفحة من نحن" : "About Us Stats")}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        {t('admin.companyStatsDesc') || (language === 'ar' ? "الأرقام والإحصائيات المعروضة في صفحة من نحن (About Us) لتعزيز ثقة المحلات والعملاء." : "Key wholesale figures and milestones displayed on the About Us page.")}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
                                        🚚 {t('admin.statDeliveries') || "عمليات التوصيل الناجحة"}
                                    </label>
                                    <input
                                        type="text"
                                        value={statsContent.statDeliveries}
                                        onChange={(e) => setStatsContent({ ...statsContent, statDeliveries: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200/80 dark:border-white/10 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0B192C] outline-none transition-all"
                                        placeholder="+9000"
                                    />
                                    <p className="text-xs text-slate-400">مثال: +9000 توصيل لكافة المحافظات</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
                                        🏢 {t('admin.statBrands') || "الوكالات والعلامات التجارية"}
                                    </label>
                                    <input
                                        type="text"
                                        value={statsContent.statBrands}
                                        onChange={(e) => setStatsContent({ ...statsContent, statBrands: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200/80 dark:border-white/10 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0B192C] outline-none transition-all"
                                        placeholder="+100"
                                    />
                                    <p className="text-xs text-slate-400">مثال: +100 وكالة تجارية حصرية</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
                                        📦 {t('admin.statProducts') || "المنتجات المتاحة بالجملة"}
                                    </label>
                                    <input
                                        type="text"
                                        value={statsContent.statProducts}
                                        onChange={(e) => setStatsContent({ ...statsContent, statProducts: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200/80 dark:border-white/10 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0B192C] outline-none transition-all"
                                        placeholder="+500"
                                    />
                                    <p className="text-xs text-slate-400">مثال: +500 صنف غذائي واستهلاكي</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
                                        🏪 {t('admin.statClients') || "العملاء والمحلات النشطة"}
                                    </label>
                                    <input
                                        type="text"
                                        value={statsContent.statClients}
                                        onChange={(e) => setStatsContent({ ...statsContent, statClients: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200/80 dark:border-white/10 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0B192C] outline-none transition-all"
                                        placeholder="+300"
                                    />
                                    <p className="text-xs text-slate-400">مثال: +300 متجر وسوبرماركت شريك</p>
                                </div>
                            </div>

                            {/* Live Preview Card */}
                            <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-white/10">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                                    {language === 'ar' ? 'معاينة مباشرة في المتجر' : 'Live Homepage Preview'}
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5">
                                    <div className="text-center p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5">
                                        <p className="text-xl md:text-2xl font-black text-[#0B192C] dark:text-[#8A6305]">{statsContent.statDeliveries}</p>
                                        <p className="text-xs font-semibold text-slate-500 mt-1">{language === 'ar' ? 'عملية توصيل' : 'Deliveries'}</p>
                                    </div>
                                    <div className="text-center p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5">
                                        <p className="text-xl md:text-2xl font-black text-[#0B192C] dark:text-[#8A6305]">{statsContent.statBrands}</p>
                                        <p className="text-xs font-semibold text-slate-500 mt-1">{language === 'ar' ? 'وكالة معتمدة' : 'Brands'}</p>
                                    </div>
                                    <div className="text-center p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5">
                                        <p className="text-xl md:text-2xl font-black text-[#0B192C] dark:text-[#8A6305]">{statsContent.statProducts}</p>
                                        <p className="text-xs font-semibold text-slate-500 mt-1">{language === 'ar' ? 'منتج متاح' : 'Products'}</p>
                                    </div>
                                    <div className="text-center p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5">
                                        <p className="text-xl md:text-2xl font-black text-[#0B192C] dark:text-[#8A6305]">{statsContent.statClients}</p>
                                        <p className="text-xs font-semibold text-slate-500 mt-1">{language === 'ar' ? 'عميل ومحل' : 'Active Clients'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: FOOTER & SOCIAL LINKS */}
                    {activeTab === "footer" && (
                        <div className="animate-in fade-in-50 duration-200">
                            <FooterContentSection
                                footerContent={footerContent}
                                categories={categories}
                                onFieldChange={handleFooterFieldChange}
                                t={t}
                            />
                        </div>
                    )}

                    {/* TAB 3: PROMO & MIDDLE BANNERS */}
                    {activeTab === "banners" && (
                        <div className="space-y-8 animate-in fade-in-50 duration-200">
                            {/* Categories CTA Banner */}
                            <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 md:p-8 shadow-xs">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {t('admin.categoriesCtaBanner') || "Categories CTA Banner"}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        {t('admin.categoriesCtaBannerDesc') || "Control the Call To Action banner shown on the Categories landing page."}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                            {t('admin.imageUrl')}
                                        </label>
                                        <div className="flex gap-4 items-start">
                                            <input
                                                type="text"
                                                value={ctaImage}
                                                onChange={(e) => setCtaImage(e.target.value)}
                                                className="flex-1 px-4 py-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0B192C] outline-none text-sm"
                                                placeholder="https://images.unsplash.com/..."
                                            />
                                            <div className="w-28 h-16 rounded-xl border border-slate-200/80 dark:border-white/10 overflow-hidden bg-slate-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                                {ctaImage ? (
                                                    <img src={ctaImage} alt="CTA Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                                ) : (
                                                    <Image className="text-2xl text-slate-400" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-md text-slate-700 dark:text-slate-300">🇬🇧 English</span>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">{t('admin.bannerTitle') || "Title"}</label>
                                                <input type="text" value={ctaTitle} onChange={(e) => setCtaTitle(e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">{t('admin.description')}</label>
                                                <textarea rows={3} value={ctaDesc} onChange={(e) => setCtaDesc(e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm resize-none" />
                                            </div>
                                        </div>

                                        <div className="space-y-4" dir="rtl">
                                            <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-md text-slate-700 dark:text-slate-300">🇸🇦 العربية</span>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">{t('admin.bannerTitle') || "العنوان"}</label>
                                                <input type="text" value={ctaTitleAr} onChange={(e) => setCtaTitleAr(e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">{t('admin.description')}</label>
                                                <textarea rows={3} value={ctaDescAr} onChange={(e) => setCtaDescAr(e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm resize-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Middle Banner 1 */}
                            <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 md:p-8 shadow-xs">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {t('admin.middleBanner1') || "Middle Banner 1 (After Trending)"}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        {t('admin.middleBanner1Desc') || "Control the full-width banner that appears after the Trending Products section."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('admin.imageUrl')}</label>
                                        <input type="text" value={middleBanner1Image} onChange={(e) => setMiddleBanner1Image(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" placeholder="https://..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('admin.linkUrl')}</label>
                                        <input type="text" value={middleBanner1Link} onChange={(e) => setMiddleBanner1Link(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" placeholder="/categories or /products" />
                                    </div>
                                </div>
                            </div>

                            {/* Middle Banner 2 */}
                            <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 md:p-8 shadow-xs">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {t('admin.middleBanner2') || "Middle Banner 2 (After Featured Collection)"}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        {t('admin.middleBanner2Desc') || "Configure the secondary promotional banner with call to action button."}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">{t('admin.imageUrl')}</label>
                                            <input type="text" value={middleBanner2Image} onChange={(e) => setMiddleBanner2Image(e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" placeholder="https://..." />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">{t('admin.linkUrl')}</label>
                                            <input type="text" value={middleBanner2Link} onChange={(e) => setMiddleBanner2Link(e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" placeholder="/categories" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-md text-slate-700 dark:text-slate-300">🇬🇧 English</span>
                                            <input type="text" value={middleBanner2Title} onChange={(e) => setMiddleBanner2Title(e.target.value)} placeholder="Title" className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" />
                                            <input type="text" value={middleBanner2Subtitle} onChange={(e) => setMiddleBanner2Subtitle(e.target.value)} placeholder="Subtitle" className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" />
                                            <input type="text" value={middleBanner2ButtonText} onChange={(e) => setMiddleBanner2ButtonText(e.target.value)} placeholder="Button Text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" />
                                        </div>
                                        <div className="space-y-3" dir="rtl">
                                            <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-md text-slate-700 dark:text-slate-300">🇸🇦 العربية</span>
                                            <input type="text" value={middleBanner2TitleAr} onChange={(e) => setMiddleBanner2TitleAr(e.target.value)} placeholder="العنوان" className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" />
                                            <input type="text" value={middleBanner2SubtitleAr} onChange={(e) => setMiddleBanner2SubtitleAr(e.target.value)} placeholder="العنوان الفرعي" className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" />
                                            <input type="text" value={middleBanner2ButtonTextAr} onChange={(e) => setMiddleBanner2ButtonTextAr(e.target.value)} placeholder="نص الزر" className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: SHIPPING & POLICIES */}
                    {activeTab === "shipping" && (
                        <ShippingPolicyEditor
                            value={shippingPolicyContent}
                            onChange={setShippingPolicyContent}
                            shippingReturnsImage={shippingReturnsImage}
                            onImageChange={setShippingReturnsImage}
                            onSave={handleSaveAll}
                            isSaving={isSubmitting}
                        />
                    )}

                    {/* TAB: PRIVACY POLICY */}
                    {activeTab === "privacy" && (
                        <PrivacyPolicyEditor
                            value={privacyPolicyContent}
                            onChange={setPrivacyPolicyContent}
                        />
                    )}

                    {/* TAB: CONTACT US PAGE */}
                    {activeTab === "contact" && (
                        <ContactContentSection value={contactPageContent} onChange={setContactPageContent} />
                    )}

                    {/* TAB 5: ABOUT US STORY */}
                    {activeTab === "about" && (
                        <div className="space-y-8 animate-in fade-in-50 duration-200">
                            {/* Hero Header */}
                            <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 md:p-8 shadow-xs">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {t('admin.aboutHero') || "About Us Hero Header"}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        {t('admin.aboutHeroDesc') || "Top banner text and background photo for the /about-us page."}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('admin.imageUrl')}</label>
                                        <input type="text" value={aboutHeroImage} onChange={(e) => setAboutHeroImage(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" placeholder="https://..." />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-md text-slate-700 dark:text-slate-300">🇬🇧 English</span>
                                            <input type="text" value={aboutHeroTitle} onChange={(e) => setAboutHeroTitle(e.target.value)} placeholder="Hero Title (e.g. Our Story)" className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" />
                                            <input type="text" value={aboutHeroSubtitle} onChange={(e) => setAboutHeroSubtitle(e.target.value)} placeholder="Hero Subtitle" className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" />
                                        </div>
                                        <div className="space-y-3" dir="rtl">
                                            <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-md text-slate-700 dark:text-slate-300">🇸🇦 العربية</span>
                                            <input type="text" value={aboutHeroTitleAr} onChange={(e) => setAboutHeroTitleAr(e.target.value)} placeholder="عنوان البانر (مثال: قصتنا)" className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" />
                                            <input type="text" value={aboutHeroSubtitleAr} onChange={(e) => setAboutHeroSubtitleAr(e.target.value)} placeholder="العنوان الفرعي" className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Narrative */}
                            <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 md:p-8 shadow-xs">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {t('admin.aboutNarrative') || "Company Story & Narrative"}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        {t('admin.aboutNarrativeDesc') || "Detailed mission paragraphs, founding badge, and brand motto."}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-md text-slate-700 dark:text-slate-300">🇬🇧 English</span>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">Badge Text</label>
                                                <input type="text" value={aboutNarrativeFounded} onChange={(e) => setAboutNarrativeFounded(e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">Section Title</label>
                                                <input type="text" value={aboutNarrativeTitle} onChange={(e) => setAboutNarrativeTitle(e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">Paragraph 1</label>
                                                <textarea rows={3} value={aboutNarrativeDesc1} onChange={(e) => setAboutNarrativeDesc1(e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm resize-none" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">Paragraph 2</label>
                                                <textarea rows={3} value={aboutNarrativeDesc2} onChange={(e) => setAboutNarrativeDesc2(e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm resize-none" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">Brand Quote / Motto</label>
                                                <input type="text" value={aboutNarrativeQuote} onChange={(e) => setAboutNarrativeQuote(e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" />
                                            </div>
                                        </div>

                                        <div className="space-y-4" dir="rtl">
                                            <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-md text-slate-700 dark:text-slate-300">🇸🇦 العربية</span>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">نص الشارة</label>
                                                <input type="text" value={aboutNarrativeFoundedAr} onChange={(e) => setAboutNarrativeFoundedAr(e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">عنوان القسم</label>
                                                <input type="text" value={aboutNarrativeTitleAr} onChange={(e) => setAboutNarrativeTitleAr(e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">الفقرة الأولى</label>
                                                <textarea rows={3} value={aboutNarrativeDesc1Ar} onChange={(e) => setAboutNarrativeDesc1Ar(e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm resize-none" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">الفقرة الثانية</label>
                                                <textarea rows={3} value={aboutNarrativeDesc2Ar} onChange={(e) => setAboutNarrativeDesc2Ar(e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm resize-none" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">الاقتباس أو الشعار</label>
                                                <input type="text" value={aboutNarrativeQuoteAr} onChange={(e) => setAboutNarrativeQuoteAr(e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
