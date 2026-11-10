import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PARTNER_PRIDE_TITLE_AR, type WebsiteContent } from '@/lib/website-content';

interface PartnerPrideBannerProps {
    language: string;
    dir: 'ltr' | 'rtl';
    content?: Partial<WebsiteContent>;
    salesPhone?: string;
    managementPhone?: string;
    whatsappUrl?: string;
}

export default function PartnerPrideBanner({
    language,
    dir,
    content,
}: PartnerPrideBannerProps) {
    const isArabic = language === 'ar' || dir === 'rtl';

    const title = isArabic
        ? (content?.homePrideTitleAr || PARTNER_PRIDE_TITLE_AR)
        : (content?.homePrideTitle || 'Proud to represent and distribute Bitinjana Brothers products');

    const description = isArabic
        ? (content?.homePrideDescriptionAr || 'أصناف أصلية تصل إلى متجرك مباشرة عبر شبكة توزيع حوا.')
        : (content?.homePrideDescription || 'Authentic Bitinjana Brothers products delivered directly to your store through the Hawa distribution network.');

    const buttonText = isArabic
        ? (content?.homePrideButtonAr || 'تصفح الأصناف')
        : (content?.homePrideButton || 'Browse products');

    const buttonLink = content?.homePrideLink || '/products';

    const highlightTargetAr = 'شركة بيتنجانة إخوان';
    const highlightTargetEn = 'Bitinjana Brothers';
    const targetPhrase = isArabic ? highlightTargetAr : highlightTargetEn;
    const highlightIndex = title.indexOf(targetPhrase);

    return (
        <section aria-label={title} className="w-full pt-5 pb-4 sm:pt-8 sm:pb-6 2xl:pt-10 2xl:pb-7">
            <div className="container-custom">
                <div className="group/pride relative w-full overflow-hidden rounded-[18px] sm:rounded-[20px] border border-[#E5B54A]/30 bg-[#0F2138] p-5 text-white transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-[#E5B54A]/55 hover:shadow-[0_24px_50px_-18px_rgba(11,25,44,0.35)] sm:px-10 sm:py-7 2xl:px-14 2xl:py-9">
                    {/* Top Subtle Gold Hairline */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#E5B54A] to-transparent opacity-65"
                    />

                    {/* Ambient HB Shield Watermark on the End Side */}
                    <Image
                        src="/images/betengana/hb-shield-logo.webp"
                        alt=""
                        aria-hidden="true"
                        width={480}
                        height={600}
                        sizes="260px"
                        className="pointer-events-none absolute -end-4 top-1/2 w-[180px] sm:w-[250px] -translate-y-1/2 select-none opacity-[0.04] transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/pride:scale-105 group-hover/pride:opacity-[0.075]"
                    />

                    <div className="relative z-10 flex flex-col items-stretch justify-between gap-4 sm:gap-6 md:flex-row md:items-center md:gap-8 2xl:gap-10">
                        {/* Start Side: Shield Crest + Pride Statement */}
                        <div className="flex min-w-0 flex-1 items-center gap-3.5 sm:gap-8 2xl:gap-11">
                            <div className="shrink-0 border-e border-[#E5B54A]/22 pe-3.5 sm:pe-8 2xl:pe-11">
                                <Image
                                    src="/images/betengana/hb-shield-logo.webp"
                                    alt={isArabic ? 'شعار شركة بيتنجانة إخوان HB' : 'Betinjaneh HB emblem'}
                                    width={480}
                                    height={600}
                                    sizes="(min-width: 640px) 120px, 60px"
                                    className="h-auto w-[58px] object-contain transition-transform duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/pride:-translate-y-[3px] group-hover/pride:scale-[1.04] sm:w-[96px] 2xl:w-[118px]"
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2 className="mb-1.5 sm:mb-2 text-[16.5px] font-extrabold leading-[1.35] tracking-tight text-white sm:text-[23px] xl:text-[25px] 2xl:text-[30px]">
                                    {highlightIndex !== -1 ? (
                                        <>
                                            {title.slice(0, highlightIndex)}
                                            <span className="relative inline-block text-[#E5B54A]">
                                                {targetPhrase}
                                                <span
                                                    aria-hidden="true"
                                                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-white transition-transform duration-380 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/pride:origin-right group-hover/pride:scale-x-100"
                                                />
                                            </span>
                                            {title.slice(highlightIndex + targetPhrase.length)}
                                        </>
                                    ) : (
                                        title
                                    )}
                                </h2>
                                <p className="max-w-[62ch] text-[12px] leading-[1.55] text-white/75 sm:text-[14.5px] sm:leading-[1.65] 2xl:text-[16px]">
                                    {description}
                                </p>
                            </div>
                        </div>

                        {/* End Side: Full-width capsule on mobile, compact capsule on desktop */}
                        <div className="shrink-0 pt-1 sm:pt-0">
                            <Link
                                href={buttonLink}
                                className="inline-flex w-full md:w-auto h-10 sm:h-[42px] 2xl:h-[48px] items-center justify-center gap-2 rounded-full bg-[#D89E28] px-6 2xl:px-7 text-[13px] sm:text-[13.5px] 2xl:text-[14.5px] font-extrabold text-[#0B192C] transition-colors duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#E5B54A]"
                            >
                                <span>{buttonText}</span>
                                {isArabic ? (
                                    <ArrowLeft className="h-4 w-4 transition-transform duration-280 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/pride:-translate-x-1" />
                                ) : (
                                    <ArrowRight className="h-4 w-4 transition-transform duration-280 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/pride:translate-x-1" />
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
