import Link from 'next/link';
import { ArrowLeft, ArrowRight, Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import type { WebsiteContent } from '@/lib/website-content';

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
    salesPhone = '+963 993 443 901',
    managementPhone,
    whatsappUrl,
}: PartnerPrideBannerProps) {
    const isArabic = language === 'ar' || dir === 'rtl';

    const badge = isArabic
        ? (content?.homePrideBadgeAr || 'وكيل توزيع معتمد')
        : (content?.homePrideBadge || 'Authorized distributor');

    const title = isArabic
        ? (content?.homePrideTitleAr || 'نفخر بتمثيل وتوزيع أصناف شركة بيتنجانة إخوان')
        : (content?.homePrideTitle || 'Proud to represent Bitinjana Brothers');

    const description = isArabic
        ? (content?.homePrideDescriptionAr || 'منتجات بيتنجانة إخوان الأصلية، متوفرة بالجملة مع توصيل مباشر لمتجرك.')
        : (content?.homePrideDescription || 'Authentic Bitinjana Brothers products, supplied wholesale and delivered to your store.');

    const buttonText = isArabic
        ? (content?.homePrideButtonAr || 'تصفح الأصناف')
        : (content?.homePrideButton || 'Browse products');

    const buttonLink = content?.homePrideLink || '/products';
    const cleanSalesPhone = salesPhone.replace(/\s+/g, '');
    const cleanManagementPhone = managementPhone?.replace(/\s+/g, '');
    const fallbackWhatsappUrl = `https://wa.me/${cleanSalesPhone.replace(/\+/g, '')}?text=${encodeURIComponent(
        isArabic
            ? 'مرحباً، أود الاستفسار عن أصناف شركة بيتنجانة إخوان وأسعار الجملة.'
            : 'Hello, I would like to ask about Bitinjana Brothers products and wholesale prices.',
    )}`;

    return (
        <section aria-label={title} className="w-full py-8 sm:py-12">
            <div className="container-custom">
                <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0f172a] sm:p-7 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-2xl space-y-2.5">
                        <p className="text-xs font-bold text-[#8A6305] dark:text-[#E5B54A]">
                            {badge}
                        </p>
                        <h2 className="text-xl font-bold leading-snug text-slate-900 dark:text-white sm:text-2xl">
                            {title}
                        </h2>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                            {description}
                        </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-start gap-3 sm:flex-row sm:items-center md:flex-col md:items-start">
                        <Link
                            href={buttonLink}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B192C] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#16304d] dark:bg-[#E5B54A] dark:text-[#0B192C] dark:hover:bg-[#f0c35d]"
                        >
                            <span>{buttonText}</span>
                            {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                        </Link>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                            <a
                                href={`tel:${cleanSalesPhone}`}
                                dir="ltr"
                                className="inline-flex items-center gap-1.5 font-medium text-slate-600 transition-colors hover:text-[#8A6305] dark:text-slate-300 dark:hover:text-[#E5B54A]"
                            >
                                <Phone className="h-3.5 w-3.5" />
                                <span>{isArabic ? 'المبيعات:' : 'Sales:'} {salesPhone}</span>
                            </a>
                            {managementPhone && cleanManagementPhone && (
                                <a
                                    href={`tel:${cleanManagementPhone}`}
                                    dir="ltr"
                                    className="inline-flex items-center gap-1.5 font-medium text-slate-600 transition-colors hover:text-[#8A6305] dark:text-slate-300 dark:hover:text-[#E5B54A]"
                                >
                                    <Phone className="h-3.5 w-3.5" />
                                    <span>{isArabic ? 'الإدارة:' : 'Office:'} {managementPhone}</span>
                                </a>
                            )}
                            <a
                                href={whatsappUrl || fallbackWhatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 font-medium text-emerald-700 transition-colors hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                            >
                                <FaWhatsapp className="h-3.5 w-3.5" />
                                {isArabic ? 'واتساب' : 'WhatsApp'}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
