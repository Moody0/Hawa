"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { Truck, UserCheck, CheckCircle2, Phone, Clock, Store, Receipt, Snowflake, Shield, AlertCircle, RotateCcw } from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa";
import { Settings } from "@prisma/client";

interface ShippingReturnsContentProps {
    siteSettings: Settings | any | null;
}

export default function ShippingReturnsContent({ siteSettings }: ShippingReturnsContentProps) {
    const { t, dir, language } = useLanguage();
    const isAr = language === 'ar' || dir === 'rtl';

    // Phone / WhatsApp setup
    const defaultWa = '+963993443901';
    const rawWa = siteSettings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || defaultWa;
    const cleanWaNumber = rawWa.replace(/[^0-9]/g, '');

    // Helper to get bilingual text from siteSettings or fallback
    const getContent = (fieldEn: keyof Settings, fieldAr: keyof Settings, fallbackEn: string, fallbackAr: string) => {
        if (!siteSettings) return isAr ? fallbackAr : fallbackEn;
        const val = isAr ? siteSettings[fieldAr] : siteSettings[fieldEn];
        return (val as string) || (isAr ? fallbackAr : fallbackEn);
    };

    return (
        <div className="w-full bg-[#FCFBF8] dark:bg-[#070D18] text-[#0B192C] dark:text-slate-100 transition-colors py-10 md:py-16" dir={dir}>
            <div className="container-custom max-w-4xl mx-auto">
                
                {/* Header: Clean & Informative */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8A6305]/10 border border-[#8A6305]/20 text-[#8A6305] dark:text-[#E5B54A] text-xs font-bold uppercase tracking-wider mb-3">
                        <Truck className="text-sm" />
                        <span>{isAr ? 'تعليمات التوزيع وسياسة التوريد' : 'Wholesale Delivery & Shipping Rules'}</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-[#0B192C] dark:text-white tracking-tight leading-tight mb-3">
                        {isAr ? 'شروط الشحن وتعليمات استلام البضائع' : 'Shipping Guidelines & Receiving Policy'}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                        {isAr 
                            ? 'دليل إرشادي مبسط يوضح قواعد تسليم طرود الجملة لباب المحل، إجراءات فحص الكراتين، وسياسة معالجة الملاحظات لشركائنا التجاريين.'
                            : 'Clear guidelines regarding wholesale case delivery to your store, carton verification upon receipt, and claims resolution.'}
                    </p>
                </div>

                <div className="space-y-8">
                    
                    {/* Section 1: قواعد الشحن والتسليم */}
                    <div className="bg-white dark:bg-[#132035] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-xs">
                        <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-white/5 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-[#8A6305]/10 text-[#8A6305] dark:text-[#E5B54A] flex items-center justify-center text-xl shrink-0">
                                <Truck />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-black text-[#0B192C] dark:text-white">
                                    {isAr ? '1. قواعد الشحن والتوصيل المباشر' : '1. Shipping & Store-Door Delivery Rules'}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {isAr ? 'مواعيد العمل، تأكيد الطلبيات، وآلية التسليم لباب المتجر' : 'Lead times, order confirmation, and store delivery logistics'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Rule 1: التأكيد */}
                            <div className="flex items-start gap-3.5">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 text-[#8A6305] dark:text-[#E5B54A] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                    1
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white mb-1">
                                        {getContent('verificationTitle', 'verificationTitleAr', 'Direct Order Verification', 'تأكيد الطلبية وجدولتها قبل الانطلاق')}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {getContent(
                                            'verificationDesc', 
                                            'verificationDescAr', 
                                            'Our logistics desk confirms carton quantities and recipient contact details by phone before dispatching the delivery vehicle.',
                                            'يتواصل منسق الحركة اللوجستية هاتفياً لتأكيد أعداد الكراتين، نوع البضاعة، وعنوان المحل بدقة قبل تحريك سيارة التوزيع لضمان عدم حدوث أي تأخير أو خطأ.'
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Rule 2: مواعيد التسليم */}
                            <div className="flex items-start gap-3.5">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 text-[#8A6305] dark:text-[#E5B54A] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                    2
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white mb-2">
                                        {isAr ? 'مواعيد وفترات التوريد المعتمدة' : 'Official Delivery Timelines'}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                                            <span className="block text-[11px] font-bold text-[#8A6305] dark:text-[#E5B54A] uppercase tracking-wider mb-0.5">
                                                {isAr ? 'حمص والمنطقة الوسطى' : 'Central Region (Homs)'}
                                            </span>
                                            <span className="text-sm font-black text-[#0B192C] dark:text-white">
                                                {siteSettings?.expressShippingTime || (isAr ? 'توصيل خلال 24 ساعة (رحلات يومية)' : 'Within 24 Hours (Daily Runs)')}
                                            </span>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                                            <span className="block text-[11px] font-bold text-[#8A6305] dark:text-[#E5B54A] uppercase tracking-wider mb-0.5">
                                                {isAr ? 'باقي المحافظات السورية' : 'All Other Governorates'}
                                            </span>
                                            <span className="text-sm font-black text-[#0B192C] dark:text-white">
                                                {siteSettings?.standardShippingTime || (isAr ? '1 - 3 أيام عمل حسب جدول المحافظة' : '1 - 3 Business Days')}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {isAr 
                                            ? 'ملاحظة: شبكة سيارات التوزيع تغطي المتاجر ومحلات الجملة في كافة المحافظات وفق جداول أسبوعية منتظمة.'
                                            : 'Note: Distribution vehicles serve retailers across all Syrian governorates according to scheduled weekly runs.'}
                                    </p>
                                </div>
                            </div>

                            {/* Rule 3: التوصيل لباب المحل */}
                            <div className="flex items-start gap-3.5">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 text-[#8A6305] dark:text-[#E5B54A] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                    3
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white mb-1">
                                        {isAr ? 'التسليم المباشر لباب المحل' : 'Direct Store-Door Unloading'}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {isAr 
                                            ? 'يتولى سائق ومندوب التوزيع إنزال الطرود وتسليمها مباشرة على عتبة متجركم أو داخل مستودع المحل دون أن يتحمل التاجر أعباء نقل إضافية.'
                                            : 'Our delivery team brings your wholesale cartons right to your shop door or ground floor storage room.'}
                                    </p>
                                </div>
                            </div>

                            {/* Rule 4: المعاينة ومطابقة الفاتورة */}
                            <div className="flex items-start gap-3.5">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 text-[#8A6305] dark:text-[#E5B54A] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                    4
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white mb-1">
                                        {getContent('shippingTitle', 'shippingTitleAr', 'Inspection & Official Invoice Check', 'المعاينة الفورية ومطابقة الفاتورة')}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {isAr 
                                            ? 'يطلب من صاحب المحل أو المستلم مطابقة أعداد الكراتين وسلامة الأختام مع المندوب ومقارنتها بالفاتورة الورقية المرفقة قبل التوقيع على إشعار الاستلام وسداد القيمة.'
                                            : 'Merchants are requested to verify carton counts, check manufacturer seals with the driver, and reconcile the items against the attached printed invoice.'}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Section 2: سياسة الجودة والمطابقة والاستبدال */}
                    <div className="bg-white dark:bg-[#132035] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-xs">
                        <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-white/5 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
                                <RotateCcw />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-black text-[#0B192C] dark:text-white">
                                    {isAr ? '2. سياسة الجودة والمطابقة والكراتين التالفة' : '2. Quality, Claims & Damaged Carton Policy'}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {isAr ? 'إجراءات استبدال الكراتين المتضررة وحماية حق التاجر' : 'Discrepancy handling, damaged carton credits, and merchant protections'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Rule 1: كراتين مصنع أصلية */}
                            <div className="flex items-start gap-3.5">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                    1
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white mb-1">
                                        {getContent('finalSaleTitle', 'finalSaleTitleAr', 'Manufacturer Sealed Wholesale Cases', 'تسليم بكراتين وعبوات المصنع الأصلية')}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {isAr 
                                            ? 'تسلم كافة بضائع الجملة (المعكرونة، الزيوت، التونة، البقوليات) في كراتين وعبوات المصنع الأصلية المغلقة والمطابقة للمواصفات القياسية وتواريخ الصلاحية المعتمدة.'
                                            : 'All wholesale items are delivered in intact factory cases with original manufacturer seals and certified shelf-life.'}
                                    </p>
                                </div>
                            </div>

                            {/* Rule 2: استبدال فوري مع المندوب */}
                            <div className="flex items-start gap-3.5">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                    2
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white mb-1">
                                        {isAr ? 'الاستبدال الفوري لأي كرتونة متضررة أثناء النقل' : 'Immediate On-Site Driver Replacement / Credit'}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {isAr 
                                            ? 'في حال وجود أي كرتونة تعرضت للتلف أو الكسر أثناء الطريق، يحق للتاجر إرجاعها فوراً مع سائق الشحنة، ويتم تعديل الفاتورة أو خصم قيمتها في لحظة الاستلام دون أي تعقيدات.'
                                            : 'If any case is damaged during transit, you can immediately hand it back to the delivery driver. The invoice amount will be credited on the spot.'}
                                    </p>
                                </div>
                            </div>

                            {/* Rule 3: مهلة 24 ساعة */}
                            <div className="flex items-start gap-3.5">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                    3
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white mb-1">
                                        {isAr ? 'مهلة 24 ساعة للإبلاغ عن الملاحظات الخفية' : '24-Hour Concealed Defect Notification'}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                                        {isAr 
                                            ? 'إذا تبين بعد فتح الكرتونة وجود نقص أو عيب مصنعي داخلي لم يظهر أثناء المعاينة الخارجية، يرجى اتباع الخطوتين التاليتين خلال 24 ساعة من الاستلام:'
                                            : 'If a sealed case contains an internal packaging fault or discrepancy discovered after the driver leaves, follow these steps within 24 hours:'}
                                    </p>
                                    <div className="bg-slate-50 dark:bg-white/[0.02] rounded-xl p-3.5 border border-slate-200/60 dark:border-white/5 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="text-emerald-500 text-sm shrink-0" />
                                            <span>{isAr ? 'تصوير الكرتونة المصابة ورقم الوجبة (Batch Number).' : 'Photograph the affected case and batch number.'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="text-emerald-500 text-sm shrink-0" />
                                            <span>{isAr ? 'إرسال الصور مع صورة الفاتورة إلى واتساب إدارة الحركة لمعالجة الاستبدال في الشحنة التالية.' : 'Send photos with invoice copy to WhatsApp Dispatch for instant resolution.'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Rule 4: التخزين والسلامة */}
                            <div className="flex items-start gap-3.5">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                    4
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white mb-1">
                                        {getContent('hygieneTitle', 'hygieneTitleAr', 'Safety & Temperature Storage Standards', 'معايير التخزين والسلامة الغذائية')}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {getContent(
                                            'hygieneDesc',
                                            'hygieneDescAr',
                                            'Our warehouses and trucks maintain controlled temperature environments, with total physical segregation between food items and household goods.',
                                            'تخضع مستودعاتنا وشاحناتنا لضوابط عزل دقيقة لدرجات الحرارة، مع فصل كامل بين المواد الغذائية والمنظفات المنزلية للحفاظ على جودة ونكهة السلع.'
                                        )}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Section 3: شريط الاستفسارات والدعم السريع */}
                    <div className="bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
                        <div>
                            <h3 className="text-sm sm:text-base font-bold text-[#0B192C] dark:text-white mb-0.5">
                                {isAr ? 'هل لديك استفسار بخصوص مواعيد الشحن لمتجرك؟' : 'Questions regarding delivery schedules to your store?'}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {isAr ? 'فريق حركة وتنسيق التوزيع جاهز للإجابة وتحديد موعد الرحلة القادمة لمنطقتك.' : 'Our logistics dispatch desk is available to confirm route timings and order status.'}
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                            <a
                                href={`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
                                    isAr 
                                        ? 'مرحباً، أود الاستفسار عن موعد رحلة التوزيع القادمة لمنطقتي.'
                                        : 'Hello, I have an inquiry regarding wholesale delivery schedules to my area.'
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-xs"
                            >
                                <FaWhatsapp className="text-sm" />
                                <span>{isAr ? 'واتساب الحركة' : 'WhatsApp'}</span>
                            </a>
                            <a
                                href={`tel:${cleanWaNumber}`}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#132035] border border-slate-200 dark:border-white/10 text-[#0B192C] dark:text-white hover:bg-slate-50 text-xs font-bold transition-all shadow-xs"
                            >
                                <Phone className="text-sm" />
                                <span dir="ltr">+963 993 443 901</span>
                            </a>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
