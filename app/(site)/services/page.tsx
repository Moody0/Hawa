import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
    MdWarehouse, 
    MdLocalShipping, 
    MdCampaign, 
    MdVerified, 
    MdSupportAgent, 
    MdStorefront,
    MdCheckCircle,
    MdArrowForward
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';

export const metadata: Metadata = {
    title: 'خدمات التوزيع والتجارة | Distribution Services - Hawa',
    description: 'تعرف على خدمات التوزيع، أسطول النقل المجهز، المستودعات المركزية، والتسويق التجاري التي تقدمها شركة حوا للتوزيع والتجارة.',
    openGraph: {
        title: 'خدمات التوزيع والتجارة | شركة حوا للتوزيع',
        description: 'حلول توزيع وتخزين وتسويق متكاملة للسلع الغذائية والاستهلاكية.',
    },
};

export default function ServicesPage() {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+963900000000';
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

    const services = [
        {
            icon: MdLocalShipping,
            title: 'أسطول التوزيع المنتظم',
            subtitle: 'تغطية لوجستية واسعة للمحافظات والأسواق',
            desc: 'نمتلك أسطولاً مجهزاً من الشاحنات والسيارات المغلقة والمكيفة التي تقوم برحلات توزيع مجدولة دورياً لتسليم طرود الجملة مباشرة إلى أبواب المحلات والسوبرماركت دون تأخير.',
            points: ['تسليم مجدول في مواعيد ثابتة', 'سيارات مجهزة للمواد الحساسة للحرارة', 'فريق تسليم وسائقين محترفين'],
        },
        {
            icon: MdWarehouse,
            title: 'المستودعات وإدارة المخزون المعيارية',
            subtitle: 'تخزين آمن ومحكم وفق المعايير الصحية',
            desc: 'مستودعات مركزية مجهزة بأنظمة تحكم بالرطوبة والحرارة لضمان بقاء السلع الغذائية والاستهلاكية في أعلى درجات الجودة حتى وصولها للمستهلك.',
            points: ['أنظمة جرد رقمية حديثة', 'مراقبة مستمرة لصلاحيات المنتجات', 'مساحات تخزين واسعة للكميات الضخمة'],
        },
        {
            icon: MdCampaign,
            title: 'التسويق التجاري وبناء الحضور',
            subtitle: 'دعم العلامة بالانتشار والترويج',
            desc: 'لا نكتفي بإيصال البضاعة إلى الرفوف، بل نساعد الوكالات والشركات المنتجة في تسويق منتجاتها عبر حملات إعلانية وتصوير احترافي ودعم مواد نقاط البيع (POS).',
            points: ['صناعة المحتوى والتصوير الإعلاني', 'إدارة حملات ترويجية للمنتجات الجديدة', 'توفير ستاندات ومواد عرض للمحلات'],
        },
        {
            icon: MdSupportAgent,
            title: 'خدمة ودعم أصحاب المحلات',
            subtitle: 'تنسيق الطلبات وتسهيل الفواتير',
            desc: 'فريق مبيعات مخصص يتابع متطلبات كل محل تجاري، ويساعده في اختيار أنسب تشكيلة طرود تحقق أعلى أرباح، مع إمكانية الطلب المباشر عبر الموقع والواتساب.',
            points: ['تواصل فوري عبر الواتساب', 'معالجة وتأكيد الطلبات خلال دقائق', 'تسهيل إعادة طلب الطرود المتكررة'],
        },
    ];

    return (
        <main className="py-10 md:py-16">
            <div className="container-custom">
                {/* Hero Header */}
                <div className="max-w-3xl mx-auto text-center mb-12 md:mb-20">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8A6305]/10 border border-[#8A6305]/25 text-[#8A6305] dark:text-[#8A6305] text-xs font-bold uppercase tracking-wider mb-3">
                        <span>🚚 حلول التوزيع اللوجستي</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B192C] dark:text-white tracking-tight leading-tight mb-4">
                        خدمات توزيع احترافية تغطي سلاسل التوريد بالكامل
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-[#475569] dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
                        نحن حلقة الوصل الموثوقة بين الوكالات العالمية والمحلية وأصحاب المحلات، نوفر منظومة متكاملة من التخزين، الشحن، التسويق، واستقبال الطلبات.
                    </p>
                </div>

                {/* Services Detailed Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {services.map((svc, idx) => {
                        const Icon = svc.icon;
                        return (
                            <div
                                key={idx}
                                className="bg-white dark:bg-[#132035] rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-white/10 shadow-xs hover:border-[#8A6305]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="w-14 h-14 rounded-2xl bg-[#FAF6EC] dark:bg-white/5 border border-[#8A6305]/20 flex items-center justify-center mb-6">
                                        <Icon className="text-3xl text-[#8A6305] dark:text-[#8A6305]" />
                                    </div>
                                    <h3 className="text-xl font-black text-[#0B192C] dark:text-white mb-1">
                                        {svc.title}
                                    </h3>
                                    <h4 className="text-xs font-bold text-[#8A6305] dark:text-[#8A6305] mb-3">
                                        {svc.subtitle}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-[#475569] dark:text-gray-300 leading-relaxed mb-6">
                                        {svc.desc}
                                    </p>
                                </div>

                                <ul className="space-y-2.5 pt-4 border-t border-gray-100 dark:border-white/5">
                                    {svc.points.map((pt, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs font-bold text-[#0B192C] dark:text-gray-200">
                                            <MdCheckCircle className="text-base text-[#8A6305] dark:text-[#E5B54A] shrink-0" />
                                            <span>{pt}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Call to Action */}
                <div className="bg-gradient-to-r from-[#0B192C] via-[#0F172A] to-[#1e293b] rounded-3xl p-8 sm:p-12 text-white text-center md:text-start flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                    <div className="relative z-10 max-w-xl">
                        <h3 className="text-2xl sm:text-3xl font-black mb-2">
                            هل تريد توسيع انتشار منتجاتك أو تزويد محلك بالطرود؟
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                            فريق التوزيع والمبيعات في شركة حوا جاهز للإجابة على جميع الاستفسارات التجارية وجدولة طلبياتكم فوراً.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
                        <Link
                            href="/products"
                            className="px-6 py-3.5 rounded-full bg-white text-[#0B192C] font-extrabold text-xs sm:text-sm hover:bg-gray-100 transition-all active:scale-95 shadow-md"
                        >
                            تصفح المنتجات والطرود
                        </Link>
                        <a
                            href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent('مرحباً شركة حوا، أود الاستفسار عن خدمات التوزيع والشراكات التجارية.')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 shadow-md"
                        >
                            <FaWhatsapp className="text-lg" />
                            <span>تواصل عبر واتساب</span>
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}
