import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Award, Users, Truck, Store, Building2, ArrowLeft, ArrowRight } from 'lucide-react';

interface PromoBannerProps {
    settings?: {
        middleBanner1Image?: string | null;
        middleBanner1Link?: string | null;
    } | null;
    dir?: 'rtl' | 'ltr';
    language?: 'en' | 'ar';
}

const PromoBanner = ({ settings, dir = 'rtl', language = 'ar' }: PromoBannerProps) => {
    const isArabic = dir === 'rtl' || language === 'ar';
    const bannerLink = settings?.middleBanner1Link || '/account/register';
    const bannerImage = settings?.middleBanner1Image || '/images/b2b-handshake-closeup.jpg';
    const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

    const benefits = [
        { icon: Award, titleAr: 'أسعار خاصة', titleEn: 'Tiered pricing', detailAr: 'وتنافسية', detailEn: 'Competitive rates' },
        { icon: Users, titleAr: 'دعم مخصص', titleEn: 'Dedicated support', detailAr: 'لمتجرك', detailEn: 'For your store' },
        { icon: Truck, titleAr: 'توصيل منظم', titleEn: 'Reliable delivery', detailAr: 'بمواعيد واضحة', detailEn: 'Clear schedules' },
        { icon: Store, titleAr: 'تغطية واسعة', titleEn: 'Wide coverage', detailAr: 'لمختلف المناطق', detailEn: 'Across regions' },
    ];

    return (
        <section className="container-custom pb-12 md:pb-16">
            <div className="relative overflow-hidden rounded-3xl bg-[#07152B] text-white border border-[#8A6305]/30 shadow-[0_24px_70px_-42px_rgba(7,21,43,0.85)]">
                <div className="absolute -top-28 -end-20 h-64 w-64 rounded-full bg-[#8A6305]/15 blur-3xl" aria-hidden="true" />

                <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
                    <div className="relative hidden min-h-[260px] overflow-hidden lg:block" data-reveal-item>
                        <Image
                            src={bannerImage}
                            alt={isArabic ? 'شراكة توريد لأصحاب المتاجر' : 'Wholesale supply partnership'}
                            fill
                            sizes="(min-width: 1024px) 36vw, 0px"
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#07152B]/15 to-[#07152B]" />
                    </div>

                    <div className="relative z-10 p-5 sm:p-7 lg:p-8 xl:p-10" dir={dir}>
                        <div className="grid gap-7 xl:grid-cols-[0.9fr_1.1fr] xl:items-center">
                            <div className="text-start">
                                <span className="inline-flex items-center gap-2 rounded-full border border-[#E5B54A]/30 bg-[#E5B54A]/10 px-3 py-1 text-[10px] font-black tracking-wider text-[#E5B54A]">
                                    <Building2 className="h-3.5 w-3.5" />
                                    {isArabic ? 'بوابة شركاء حوا' : 'Hawa partner portal'}
                                </span>
                                <h2 className="mt-3 text-xl sm:text-2xl lg:text-3xl font-black leading-tight text-white" data-reveal-heading>
                                    {isArabic ? 'هل لديك متجر أو سوبرماركت؟' : 'Do you own a store or supermarket?'}
                                </h2>
                                <p className="mt-2 max-w-lg text-xs sm:text-sm leading-relaxed text-slate-300" data-reveal-copy>
                                    {isArabic
                                        ? 'افتح حساباً تجارياً واحصل على أسعار جملة وخدمات توزيع مصممة لاحتياجات متجرك.'
                                        : 'Open a commercial account for wholesale pricing and distribution tailored to your store.'}
                                </p>
                                <Link
                                    href={bannerLink}
                                    className="mt-5 inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#C28E2B] px-5 py-2.5 text-sm font-black text-white transition-all hover:bg-[#A37420] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B54A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07152B] active:scale-[0.98]"
                                >
                                    <span>{isArabic ? 'إنشاء حساب تجاري' : 'Create commercial account'}</span>
                                    <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                                {benefits.map((benefit) => {
                                    const Icon = benefit.icon;
                                    return (
                                        <div key={benefit.titleEn} data-reveal-item className="flex min-h-24 items-center gap-3 bg-white/[0.045] p-3.5 sm:p-4">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E5B54A]/10 text-[#E5B54A]">
                                                <Icon className="h-5 w-5" aria-hidden="true" />
                                            </span>
                                            <span className="min-w-0 text-start">
                                                <strong className="block text-xs sm:text-sm text-white">{isArabic ? benefit.titleAr : benefit.titleEn}</strong>
                                                <span className="mt-0.5 block text-[10px] sm:text-xs text-slate-400">{isArabic ? benefit.detailAr : benefit.detailEn}</span>
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PromoBanner;
