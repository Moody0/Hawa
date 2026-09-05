'use client';

import React, { useState } from 'react';
import { Metadata } from 'next';
import { 
    MdPhone, 
    MdLocationOn, 
    MdAccessTime, 
    MdStore, 
    MdSend, 
    MdSupportAgent,
    MdEmail
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function ContactUsPage() {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+963900000000';
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

    const [formData, setFormData] = useState({
        shopName: '',
        name: '',
        phone: '',
        city: 'حمص',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.phone.trim()) {
            toast.error('يرجى كتابة الاسم ورقم الهاتف على الأقل');
            return;
        }

        const text = `مرحباً شركة هوا للتوزيع،\nالاسم: ${formData.name}\nالمحل: ${formData.shopName || 'غير محدد'}\nالهاتف: ${formData.phone}\nالمدينة: ${formData.city}\nالرسالة: ${formData.message}`;
        window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`, '_blank');
        toast.success('جاري توجيه رسالتك إلى واتساب المبيعات...');
    };

    return (
        <main className="container-custom py-10 md:py-16">
            {/* Header */}
            <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8A6305]/10 border border-[#8A6305]/25 text-[#8A6305] dark:text-[#8A6305] text-xs font-bold uppercase tracking-wider mb-3">
                    <span>📞 تواصل مباشر</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B192C] dark:text-white tracking-tight leading-tight mb-4">
                    يسعدنا تواصلكم وخدمة متجركم
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-[#475569] dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
                    فريق شركة هوا للتوزيع والتجارة في خدمتكم للإجابة على استفسارات أسعار الجملة، الشراكات مع الوكالات، وجدولة تسليم الطرود.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Contact Cards (Left 5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                    {/* WhatsApp Primary Card */}
                    <a
                        href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent('مرحباً شركة هوا للتوزيع والتجارة، أود الاستفسار عن طلبيات الجملة.')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gradient-to-br from-[#25D366]/10 via-[#25D366]/5 to-transparent border border-[#25D366]/30 hover:border-[#25D366] rounded-3xl p-6 transition-all shadow-xs hover:shadow-md group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                                <FaWhatsapp />
                            </div>
                            <div>
                                <span className="text-[11px] font-black text-[#2E7D32] uppercase tracking-wider">
                                    الاستجابة الفورية المباشرة
                                </span>
                                <h3 className="text-lg font-black text-[#0B192C] dark:text-white">
                                    واتساب المبيعات والطلبات
                                </h3>
                                <p className="text-xs text-[#475569] dark:text-gray-300 mt-0.5" dir="ltr">
                                    {whatsappNumber}
                                </p>
                            </div>
                        </div>
                    </a>

                    {/* Central Warehouse & Headquarters */}
                    <div className="bg-white dark:bg-[#132035] rounded-3xl p-6 border border-gray-200/80 dark:border-white/10 shadow-xs">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#FAF6EC] dark:bg-white/5 border border-[#8A6305]/20 text-[#8A6305] dark:text-[#8A6305] flex items-center justify-center text-2xl shrink-0">
                                <MdLocationOn />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-[#0B192C] dark:text-white mb-1">
                                    المستودعات الرئيسية والمكاتب
                                </h4>
                                <p className="text-xs text-[#475569] dark:text-gray-300 leading-relaxed">
                                    الجمهورية العربية السورية – حمص – المنطقة الصناعية / مستودعات التوزيع المركزية.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Business Working Hours */}
                    <div className="bg-white dark:bg-[#132035] rounded-3xl p-6 border border-gray-200/80 dark:border-white/10 shadow-xs">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#FAF6EC] dark:bg-white/5 border border-[#8A6305]/20 text-[#8A6305] dark:text-[#8A6305] flex items-center justify-center text-2xl shrink-0">
                                <MdAccessTime />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-[#0B192C] dark:text-white mb-1">
                                    أوقات العمل واستقبال الطلبات
                                </h4>
                                <p className="text-xs text-[#475569] dark:text-gray-300 leading-relaxed">
                                    السبت – الخميس: 8:00 صباحاً – 6:00 مساءً <br />
                                    (الطلبات عبر الموقع والواتساب متاحة 24/7 وسيتم تأكيدها أول ساعات الدوام).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Direct Message Form (Right 7 cols) */}
                <div className="lg:col-span-7 bg-white dark:bg-[#132035] p-6 sm:p-8 md:p-10 rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-md">
                    <div className="mb-6">
                        <h3 className="text-xl font-black text-[#0B192C] dark:text-white mb-1">
                            أرسل رسالة فورية إلى إدارة المبيعات
                        </h3>
                        <p className="text-xs text-[#475569] dark:text-gray-400">
                            اكتب تفاصيل طلبك أو استفسارك وسيتم تحويلها لرسالة واتساب منظمة للتواصل السريع.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                                    الاسم الكريم *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                    placeholder="محمد أحمد"
                                    className="block w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#8A6305] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                                    اسم المحل أو الشركة
                                </label>
                                <input
                                    type="text"
                                    value={formData.shopName}
                                    onChange={(e) => setFormData(p => ({ ...p, shopName: e.target.value }))}
                                    placeholder="سوبرماركت الأمانة"
                                    className="block w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#8A6305] focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                                    رقم الموبايل / واتساب *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    dir="ltr"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                                    placeholder="09xxxxxxxx"
                                    className="block w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#8A6305] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                                    المحافظة / المدينة
                                </label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                                    placeholder="حمص"
                                    className="block w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#8A6305] focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                                نص الاستفسار أو الطلب
                            </label>
                            <textarea
                                rows={4}
                                value={formData.message}
                                onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                                placeholder="اكتب الأصناف أو الوكالات التي ترغب بالاستفسار عن أسعار جملتها أو جدول توزيعها..."
                                className="block w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#8A6305] focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <FaWhatsapp className="text-xl" />
                            <span>إرسال عبر واتساب المبيعات</span>
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
