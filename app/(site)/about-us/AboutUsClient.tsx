"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import ResilientImage from "@/app/components/ResilientImage";

interface AboutUsSettings {
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
}

export default function AboutUsClient({ settings }: { settings: AboutUsSettings | null }) {
    const { t, dir, language } = useLanguage();

    const getContent = (en: string | null | undefined, ar: string | null | undefined) => {
        if (language === 'ar') return ar || en || "";
        return en || ar || "";
    };

    const heroImage = settings?.aboutHeroImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuAz8qN2iAHz-UZeEQfqOY49U5OCZ5z4ejVm7ILFjFSl9S5xg_6UuBa61qOmrkMPrBa4CuXDzHa9EN3-LNyUxi5IDK5A9TvJWkNuG-tt_RRyvJH8LvynO1daOEkTk47KDtkW3Md2ugZYShZJdxolsjiJUtDdOOz4Q7-6TNrexIvyClP0ADf1TWdbCUk1kBn8bfzhTC1cn8s9jG3yt0tDDht7__J5YKKf690SmKN4WIJX_pc2LOj3x1CnYk5JuqEu0Bzp2vGwsrYLaJWb";
    const narrativeImage = settings?.aboutNarrativeImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuC4yp4c_LJLNPwaV2ay8DZ6xRHD0UF1WqXU8eDtrdDoiVjtq9oNRc9Cn6cnbqsNwOLO-y-99jnkiLnCsGLs2rQqthU8TPqhAh2Msisbst1UyfyrILBR5fRO7KYu90u1FEoeRRjGceGVbB5vz2SJAtjzUrLLtA6BmR8VN5a5Seo4MraBJj7i4Gs4QPEZbURtSN-F7wbJsu4WNj3pEaWlye2SuJvokQhYXJ27gnAoabHg5_0_4DZY49qyKnQuMHHL9atOIILRIMD3FkeZ";

    return (
        <main className="flex-1 bg-white dark:bg-background-dark" dir={dir}>
            {/* Hero Section */}
            <section className="container-custom py-10">
                <div className="relative h-[500px] w-full overflow-hidden rounded-3xl flex items-center justify-center text-center">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
                        style={{
                            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6)), url('${heroImage}')`
                        }}
                    ></div>
                    <div className="relative z-10 max-w-3xl px-6">
                        <h1 className="text-white text-5xl md:text-8xl font-black tracking-tight mb-6 animate-fade-in-up">
                            {getContent(settings?.aboutHeroTitle, settings?.aboutHeroTitleAr)}
                        </h1>
                        <p className="text-white/95 text-lg md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in-up animation-delay-200">
                            {getContent(settings?.aboutHeroSubtitle, settings?.aboutHeroSubtitleAr)}
                        </p>
                        <div className="animate-fade-in-up animation-delay-400">
                            <Link
                                href="/products"
                                className="bg-primary hover:bg-[#9E7309] text-white px-10 py-4 rounded-2xl font-bold transition-all active:scale-95 inline-block"
                            >
                                {t('aboutUsPage.hero.cta')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Brand Narrative Section */}
            <section className="container-custom py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="order-2 lg:order-1">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-primary/10 rounded-3xl transition-all group-hover:bg-primary/15 blur-2xl"></div>
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-[#8A6305]/15 group-hover:scale-[1.02] transition-transform duration-500">
                            <ResilientImage
                                alt="Brand Narrative"
                                className="w-full h-full object-cover rounded-3xl"
                                src={narrativeImage}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>
                    </div>
                </div>
                <div className="order-1 lg:order-2 flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <span className="text-primary font-extrabold tracking-[0.2em] uppercase text-sm">
                            {getContent(settings?.aboutNarrativeFounded, settings?.aboutNarrativeFoundedAr) || t('aboutUsPage.narrative.founded')}
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black leading-tight text-text-main-light dark:text-white">
                            {getContent(settings?.aboutNarrativeTitle, settings?.aboutNarrativeTitleAr)}
                        </h2>
                    </div>
                    <div className="flex flex-col gap-6">
                        <p className="text-text-muted-light dark:text-text-muted-dark text-xl leading-relaxed">
                            {getContent(settings?.aboutNarrativeDesc1, settings?.aboutNarrativeDesc1Ar)}
                        </p>
                        <p className="text-text-muted-light dark:text-text-muted-dark text-xl leading-relaxed">
                            {getContent(settings?.aboutNarrativeDesc2, settings?.aboutNarrativeDesc2Ar)}
                        </p>
                    </div>
                    <div className="flex items-center gap-6 pt-6">
                        <div className="h-px bg-primary/20 flex-1"></div>
                        <p className="italic text-primary font-semibold text-lg">
                            {getContent(settings?.aboutNarrativeQuote, settings?.aboutNarrativeQuoteAr)}
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
