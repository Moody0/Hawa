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

    const badge = isArabic
        ? (content?.homePrideBadgeAr || 'وكيل توزيع معتمد')
        : (content?.homePrideBadge || 'Authorized distributor');

    const title = isArabic
        ? (content?.homePrideTitleAr || PARTNER_PRIDE_TITLE_AR)
        : (content?.homePrideTitle || 'Proud to represent Bitinjana Brothers');

    const description = isArabic
        ? (content?.homePrideDescriptionAr || 'منتجات بيتنجانة إخوان الأصلية، متوفرة بالجملة مع توصيل مباشر لمتجرك.')
        : (content?.homePrideDescription || 'Authentic Bitinjana Brothers products, supplied wholesale and delivered to your store.');

    const buttonText = isArabic
        ? (content?.homePrideButtonAr || 'تصفح الأصناف')
        : (content?.homePrideButton || 'Browse products');

    const buttonLink = content?.homePrideLink || '/products';

    return (
        <section aria-label={title} className="w-full pt-3 pb-4 sm:pt-4 sm:pb-6">
            <div className="container-custom">
                <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-[#EADFC8] bg-[#F3ECDA] p-4 dark:border-white/10 dark:bg-[#0f172a] sm:p-6">
                    <Image
                        src="/images/betengana/botanical-decoration-generated.webp"
                        alt=""
                        aria-hidden="true"
                        width={900}
                        height={600}
                        sizes="(min-width: 768px) 420px, 260px"
                        className="pointer-events-none absolute -bottom-4 start-[-2.5rem] w-64 select-none opacity-45 md:w-[26rem] dark:opacity-10"
                    />
                    <div className="relative z-10 flex items-center justify-between gap-3 sm:gap-8">
                        <div className="min-w-0 flex-1 space-y-2 sm:space-y-3">
                            <p className="flex items-center gap-2 text-[11px] font-semibold text-[#8A6305] dark:text-[#E5B54A] sm:text-xs">
                                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
                                {badge}
                            </p>
                            <h2 className="text-lg font-extrabold leading-snug tracking-tight text-[#0B192C] dark:text-white sm:text-3xl">
                                {isArabic && title === PARTNER_PRIDE_TITLE_AR ? (
                                    <>
                                        <span className="text-[#8A6305] dark:text-[#E5B54A]">نَفخر</span>
                                        {title.slice('نَفخر'.length)}
                                    </>
                                ) : title}
                            </h2>
                            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                                {description}
                            </p>
                            <Link
                                href={buttonLink}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0B192C] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#16304d] dark:bg-[#E5B54A] dark:text-[#0B192C] dark:hover:bg-[#f0c35d] sm:text-sm"
                            >
                                <span>{buttonText}</span>
                                {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                            </Link>
                        </div>

                        <Image
                            src="/images/betengana/brand-logo-clean.webp"
                            alt={isArabic ? 'شعار بيتنجانة إخوان' : 'Bitinjana Brothers logo'}
                            width={400}
                            height={400}
                            sizes="(min-width: 768px) 224px, 112px"
                            className="h-auto w-28 shrink-0 sm:w-44 md:w-56"
                        />
                    </div>

                </div>
            </div>
        </section>
    );
}
