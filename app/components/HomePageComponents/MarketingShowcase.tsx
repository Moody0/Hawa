'use client';

import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { Megaphone, ShoppingBag, Camera, Share2, Store, TrendingUp, Video } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export default function MarketingShowcase() {
    const { language } = useLanguage();
    const isArabic = language === 'ar';

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+963900000000';
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const marketingWaUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
        isArabic 
            ? 'مرحباً شركة حوا للتوزيع والتجارة، أود الاستفسار عن خدمات التسويق وبناء الحضور لعلامتنا التجارية.'
            : 'Hello Hawa Distribution, I would like to inquire about marketing and agency brand presence services.'
    )}`;

    const pillars = [
        {
            icon: Megaphone,
            title: isArabic ? 'إدارة الحملات الإعلانية' : 'Advertising Campaigns',
            desc: isArabic ? 'تخطيط وإطلاق حملات إعلانية موجهة للأسواق المستهدفة بدقة وفعالية.' : 'Targeted B2B & consumer advertising campaigns driving retail velocity.',
        },
        {
            icon: ShoppingBag,
            title: isArabic ? 'التسويق للمنتجات' : 'Product Marketing',
            desc: isArabic ? 'إبراز المزايا التنافسية وتجهيز خطط تسعير وتوزيع تعزز جاذبية المنتج.' : 'Positioning products with competitive wholesale strategies.',
        },
        {
            icon: Video,
            title: isArabic ? 'صناعة المحتوى' : 'Content Creation',
            desc: isArabic ? 'إنتاج فيديوهات إعلانية وتصاميم بصرية تبرز جودة وأصالة علامتك التجارية.' : 'Creative production of visual stories and high-impact promo media.',
        },
        {
            icon: Camera,
            title: isArabic ? 'التصوير الاحترافي' : 'Professional Photography',
            desc: isArabic ? 'جلسات تصوير ستوديو عالية الدقة للمنتجات ومحتوى الطرود والعبوات.' : 'High-resolution commercial product and packshot photography.',
        },
        {
            icon: Share2,
            title: isArabic ? 'إدارة السوشال ميديا' : 'Social Media Management',
            desc: isArabic ? 'بناء مجتمع رقمي نشط والتفاعل المستمر مع التجار والمستهلكين.' : 'Building and engaging active brand communities across digital channels.',
        },
        {
            icon: Store,
            title: isArabic ? 'دعم نقاط البيع (POS)' : 'POS Retail Support',
            desc: isArabic ? 'توفير مواد العرض والستاندات والبروشورات الترويجية داخل المحلات.' : 'Promotional displays, branded stands, and in-store merchant materials.',
        },
        {
            icon: TrendingUp,
            title: isArabic ? 'زيادة انتشار العلامة' : 'Brand Penetration & Growth',
            desc: isArabic ? 'توسيع رقعة التواجد على رفوف كبرى المحلات والسوبرماركت.' : 'Expanding shelf presence across supermarkets, grocery stores, and distributors.',
        },
    ];

    return (
        <section className="w-full py-12 md:py-20 bg-gradient-to-br from-[#0B192C] via-[#0F172A] to-[#0B192C] text-white relative overflow-hidden">
            {/* Background luxury aura */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#8A6305]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="container-custom relative z-10">
                {/* Section Header */}
                <div className="max-w-3xl mx-auto text-center mb-10 md:mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#8A6305] text-xs font-bold uppercase tracking-wider mb-4">
                        <span className="w-2 h-2 rounded-full bg-[#8A6305] animate-ping" />
                        <span>{isArabic ? 'قسم التسويق التجاري الحصري' : 'Commercial Marketing Division'}</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight mb-4 text-white">
                        {isArabic ? (
                            <>
                                لا نوزّع منتجاتك فقط… <br className="hidden sm:inline" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-[#8A6305]">
                                    بل نبني لها حضوراً في السوق
                                </span>
                            </>
                        ) : (
                            <>
                                We don't just distribute your products… <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-[#8A6305]">
                                    We build their market presence
                                </span>
                            </>
                        )}
                    </h2>

                    <p className="text-sm md:text-base text-gray-200/90 leading-relaxed max-w-2xl mx-auto">
                        {isArabic 
                            ? 'نمتلك فريق تسويق متخصص يعمل جنباً إلى جنب مع شبكة التوزيع، لضمان وصول علامتك التجارية إلى كل رف، وبناء ولاء حقيقي لدى أصحاب المتاجر والمستهلكين.'
                            : 'Our in-house trade marketing team partners with logistics to guarantee your agency brands dominate shelves and win lasting merchant loyalty.'}
                    </p>
                </div>

                {/* 7 Pillars Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 mb-12">
                    {pillars.map((pillar, idx) => {
                        const Icon = pillar.icon;
                        const isWide = idx === 6; // Last item expands on xl screens
                        return (
                            <div
                                key={idx}
                                className={`bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-[#8A6305]/50 rounded-2xl p-5 sm:p-6 transition-all duration-300 group flex flex-col justify-between ${
                                    isWide ? 'sm:col-span-2 lg:col-span-1 xl:col-span-2' : ''
                                }`}
                            >
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8A6305]/30 to-[#8A6305]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Icon className="text-2xl text-[#8A6305]" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-[#8A6305] transition-colors">
                                        {pillar.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                                        {pillar.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Call to Action for Brand Owners */}
                <div className="bg-gradient-to-r from-white/10 via-white/5 to-white/10 border border-white/15 rounded-3xl p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-start">
                        <h4 className="text-xl sm:text-2xl font-black text-white mb-1">
                            {isArabic ? 'هل تمتلك علامة تجارية وتبحث عن شريك توزيع وتسويق موثوق؟' : 'Are you a brand looking for a trusted distribution partner?'}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-300">
                            {isArabic ? 'تواصل مباشرة مع إدارة التسويق والشراكات التجارية لنبدأ خطة العمل فوراً.' : 'Connect directly with our Trade Marketing & Partnerships department.'}
                        </p>
                    </div>

                    <a
                        href={marketingWaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-sm sm:text-base shadow-xl transition-all active:scale-95 shrink-0"
                    >
                        <FaWhatsapp className="text-xl" />
                        <span>{isArabic ? 'تواصل مع فريق التسويق عبر واتساب' : 'Contact Marketing on WhatsApp'}</span>
                    </a>
                </div>
            </div>
        </section>
    );
}
