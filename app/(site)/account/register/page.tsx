'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomer } from '@/app/context/CustomerContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { 
    MdStore, 
    MdPerson, 
    MdPhone, 
    MdLocationOn, 
    MdLock, 
    MdVisibility, 
    MdVisibilityOff, 
    MdArrowForward,
    MdCheckCircle,
    MdSupportAgent,
    MdExpandMore,
    MdHourglassTop,
    MdShoppingBag,
    MdHome
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';

const SYRIAN_CITIES = [
    'حمص',
    'دمشق',
    'ريف دمشق',
    'حلب',
    'حماة',
    'اللاذقية',
    'طرطوس',
    'درعا',
    'السويداء',
    'القنيطرة',
    'دير الزور',
    'الرقة',
    'الحسكة',
    'إدلب',
];

export default function MerchantRegisterPage() {
    const router = useRouter();
    const { register, customer } = useCustomer();
    const { language, dir } = useLanguage();
    const isArabic = language === 'ar' || dir === 'rtl';

    const [formData, setFormData] = useState({
        shopName: '',
        ownerName: '',
        phone: '',
        city: 'حمص',
        address: '',
        password: '',
        notes: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submittedData, setSubmittedData] = useState<{ shopName: string; ownerName: string; phone: string; city: string } | null>(null);

    const SALES_MANAGER_PHONE = '+963 993 443 901';
    const SALES_MANAGER_CLEAN = '963993443901';

    React.useEffect(() => {
        if (customer) {
            router.push('/account');
        }
    }, [customer, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            // Keep digits and leading + if pasted
            const numeric = value.replace(/[^0-9+]/g, '');
            setFormData((prev) => ({ ...prev, [name]: numeric }));
            return;
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validatePhone = (rawPhone: string) => {
        let digits = rawPhone.replace(/[^0-9]/g, '');
        if (digits.startsWith('00963')) digits = '0' + digits.slice(5);
        else if (digits.startsWith('963')) digits = '0' + digits.slice(3);
        else if (digits.length === 9 && digits.startsWith('9')) digits = '0' + digits;
        return /^09[0-9]{8}$/.test(digits);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const cleanShop = formData.shopName.trim();
        const cleanOwner = formData.ownerName.trim();
        const cleanAddress = formData.address.trim();

        if (!cleanShop || !cleanOwner || !formData.phone.trim() || !formData.city.trim() || !cleanAddress || !formData.password) {
            setError(isArabic ? 'يرجى تعبئة جميع الحقول المطلوبة' : 'Please fill in all required fields');
            return;
        }

        if (cleanShop.length < 2) {
            setError(isArabic ? 'اسم المحل يجب أن يتكون من حرفين على الأقل' : 'Store name must be at least 2 characters');
            return;
        }

        if (cleanOwner.length < 2) {
            setError(isArabic ? 'اسم صاحب الطلب يجب أن يتكون من حرفين على الأقل' : 'Owner name must be at least 2 characters');
            return;
        }

        if (!validatePhone(formData.phone)) {
            setError(isArabic ? 'يرجى إدخال رقم هاتف محمول سوري صالح (مثال: 0993443901 أو 09xxxxxxxx)' : 'Please enter a valid Syrian mobile number (e.g. 0993443901)');
            return;
        }

        if (cleanAddress.length < 4) {
            setError(isArabic ? 'يرجى كتابة العنوان بشكل مفصل' : 'Please provide a detailed address');
            return;
        }

        if (formData.password.length < 6) {
            setError(isArabic ? 'كلمة المرور يجب أن لا تقل عن 6 خانات' : 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        const res = await register(formData);
        setLoading(false);

        if (res.success) {
            if (res.pendingApproval) {
                setSubmittedData({
                    shopName: cleanShop,
                    ownerName: cleanOwner,
                    phone: formData.phone,
                    city: formData.city,
                });
                setIsSubmitted(true);
            } else {
                router.push('/account');
            }
        } else {
            setError(res.error || (isArabic ? 'فشل إرسال طلب الحساب' : 'Registration request failed'));
        }
    };

    // If submitted, show the high-trust Pending Review view
    if (isSubmitted && submittedData) {
        const waMsg = encodeURIComponent(
            `مرحباً شركة حوا للتوزيع، قمت بتقديم طلب تسجيل حساب تجاري لمحل (${submittedData.shopName}) في (${submittedData.city}) بالاسم (${submittedData.ownerName}) ورقم الهاتف (${submittedData.phone}). أرجو مراجعة الطلب وتفعيل الحساب.`
        );

        return (
            <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center py-10 md:py-16 bg-slate-50/70 dark:bg-[#0B192C]/40">
                <div className="container-custom max-w-2xl w-full">
                    <div className="bg-white dark:bg-[#132035] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm p-6 sm:p-10 text-center">
                        {/* Status Icon */}
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[#8A6305] dark:text-[#E5B54A] border border-[#8A6305]/20 flex items-center justify-center mx-auto mb-5 text-3xl shadow-xs">
                            <MdHourglassTop className="animate-pulse" />
                        </div>

                        {/* Title & Badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-[#8A6305] dark:text-[#E5B54A] text-xs font-bold mb-3 border border-[#8A6305]/20">
                            <span className="w-2 h-2 rounded-full bg-[#8A6305] animate-ping" />
                            <span>{isArabic ? 'الطلب قيد المراجعة والتدقيق' : 'Request Pending Review'}</span>
                        </div>

                        <h1 className="text-xl sm:text-2xl font-black text-[#0B192C] dark:text-white tracking-tight mb-2">
                            {isArabic ? 'تم استلام طلب تسجيل محلك التجاري بنجاح!' : 'Merchant Registration Received!'}
                        </h1>

                        <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-300 max-w-lg mx-auto leading-relaxed mb-6">
                            {isArabic 
                                ? 'شكراً لانضمامك لشبكة تجار حوا. يقوم فريق إدارة المبيعات والتوزيع بمراجعة بيانات المتجر وتفعيل الحساب خلال وقت قصير لتتمكن من استعراض أسعار الجملة الرسمية.'
                                : 'Thank you for joining the Hawa merchant network. Our sales distribution team is reviewing your store details and will activate your account shortly.'}
                        </p>

                        {/* Summary Details Box */}
                        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 sm:p-5 border border-slate-200/70 dark:border-white/5 text-start space-y-2.5 mb-6 text-xs sm:text-sm">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/5">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">{isArabic ? 'اسم المحل:' : 'Store Name:'}</span>
                                <span className="font-bold text-[#0B192C] dark:text-white">{submittedData.shopName}</span>
                            </div>
                            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/5">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">{isArabic ? 'صاحب الطلب:' : 'Contact Person:'}</span>
                                <span className="font-bold text-[#0B192C] dark:text-white">{submittedData.ownerName}</span>
                            </div>
                            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/5">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">{isArabic ? 'المحافظة:' : 'Governorate:'}</span>
                                <span className="font-bold text-[#0B192C] dark:text-white">{submittedData.city}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">{isArabic ? 'رقم الهاتف المسجل:' : 'Registered Phone:'}</span>
                                <span className="font-bold font-mono text-[#8A6305] dark:text-[#E5B54A]" dir="ltr">{submittedData.phone}</span>
                            </div>
                        </div>

                        {/* WhatsApp Fast Track Action */}
                        <div className="space-y-3">
                            <a
                                href={`https://wa.me/${SALES_MANAGER_CLEAN}?text=${waMsg}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <FaWhatsapp className="text-lg" />
                                <span>{isArabic ? 'تواصل مع مدير المبيعات عبر واتساب لتسريع التفعيل' : 'Contact Sales on WhatsApp to Expedite Activation'}</span>
                            </a>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                                <Link
                                    href="/products"
                                    className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0B192C] dark:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <MdShoppingBag className="text-base text-[#8A6305]" />
                                    <span>{isArabic ? 'تصفح المنتجات والطلب كزائر' : 'Browse Products as Guest'}</span>
                                </Link>

                                <Link
                                    href="/"
                                    className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-[#0B192C] dark:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <MdHome className="text-base text-slate-500" />
                                    <span>{isArabic ? 'العودة للصفحة الرئيسية' : 'Return to Home'}</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center py-8 md:py-14 bg-slate-50/70 dark:bg-[#0B192C]/40">
            <div className="container-custom max-w-4xl w-full">
                {/* Main Card: Split Panel Layout */}
                <div className="bg-white dark:bg-[#132035] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                    
                    {/* Panel 1: Merchant Value & Trust (Hidden on mobile, 5 cols on desktop) */}
                    <div className="hidden lg:flex lg:col-span-5 bg-[#FAF6EC] dark:bg-[#0E1A29] p-6 sm:p-8 flex-col justify-between border-b lg:border-b-0 lg:border-e border-slate-200/80 dark:border-white/10">
                        <div>
                            {/* Badge */}
                            <div className="flex items-center gap-2 mb-3.5">
                                <span className="bg-amber-100 dark:bg-amber-950/50 text-[#8A6305] dark:text-[#E5B54A] border border-[#8A6305]/20 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                    {isArabic ? 'انضم لشبكة تجار حوا' : 'Join Merchant Network'}
                                </span>
                            </div>

                            <h2 className="text-xl sm:text-2xl font-black text-[#0B192C] dark:text-white tracking-tight leading-snug mb-2">
                                {isArabic ? 'سجّل محلك واطلب بأسعار الجملة' : 'Register Store for Wholesale Pricing'}
                            </h2>

                            <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 mb-5 leading-relaxed">
                                {isArabic 
                                    ? 'منصة التوريد المباشر لأصحاب البقالات والميني ماركت والسوبرماركت لكافة الوكالات المعتمدة.'
                                    : 'Direct wholesale distribution platform for grocery stores, supermarkets, and FMCG retailers.'}
                            </p>

                            {/* 4 Wholesale Benefits */}
                            <div className="space-y-3 mb-5">
                                <div className="flex items-start gap-2.5">
                                    <MdCheckCircle className="text-[#8A6305] text-lg shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white">
                                            {isArabic ? 'كشوف أسعار الجملة الفورية' : 'Instant Wholesale Access'}
                                        </h4>
                                        <p className="text-[11px] text-[#475569] dark:text-slate-400 leading-normal">
                                            {isArabic ? 'اطلاع دائم على أسعار الطرود وعروض الوكالات الرسمية' : 'Carton prices, trade offers, and volume concessions'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <MdCheckCircle className="text-[#8A6305] text-lg shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white">
                                            {isArabic ? 'توصيل وجدولة منتظمة' : 'Scheduled Direct Delivery'}
                                        </h4>
                                        <p className="text-[11px] text-[#475569] dark:text-slate-400 leading-normal">
                                            {isArabic ? 'خطوط توزيع تغطي المحافظات بمواعيد تسليم دقيقة لباب المحل' : 'Reliable delivery runs directly to your store door'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <MdCheckCircle className="text-[#8A6305] text-lg shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white">
                                            {isArabic ? 'فواتير نظامية معتمدة' : 'Official Trade Invoices'}
                                        </h4>
                                        <p className="text-[11px] text-[#475569] dark:text-slate-400 leading-normal">
                                            {isArabic ? 'توثيق كامل لحركة مشتريات محلك التجاري وأرشيف الفواتير' : 'Detailed invoices and purchase accounting records'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <MdCheckCircle className="text-[#8A6305] text-lg shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white">
                                            {isArabic ? 'استجابة وتجهيز فوري' : 'Direct WhatsApp Orders'}
                                        </h4>
                                        <p className="text-[11px] text-[#475569] dark:text-slate-400 leading-normal">
                                            {isArabic ? 'تجهيز ومتابعة طلبيات المحل مع إدارة المبيعات مباشرة' : 'Direct order fulfillment with sales management'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Direct Sales Support Box */}
                        <div className="pt-3.5 border-t border-slate-200/80 dark:border-white/10">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 text-[#475569] dark:text-slate-400">
                                    <MdSupportAgent className="text-base text-[#8A6305]" />
                                    <span>{isArabic ? 'مساعدة في التسجيل:' : 'Support:'}</span>
                                </div>
                                <a 
                                    href={`https://wa.me/${SALES_MANAGER_CLEAN}?text=${encodeURIComponent(isArabic ? 'مرحباً، أرغب بالاستفسار عن تسجيل حساب تاجر جديد لدى شركة حوا' : 'Hello, I have a question about registering as a new merchant with Hawa')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-[#8A6305] hover:text-[#735204] dark:text-[#E5B54A] flex items-center gap-1.5 font-mono"
                                >
                                    <FaWhatsapp className="text-sm text-green-600 shrink-0" />
                                    <span dir="ltr">{SALES_MANAGER_PHONE}</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Panel 2: The Registration Form (7 cols on desktop) */}
                    <div className="lg:col-span-7 p-6 sm:p-8 md:p-9 flex flex-col justify-between">
                        <div>
                            {/* Form Header with Proper Spacing */}
                            <div className="mb-5">
                                <h1 className="text-xl sm:text-2xl font-black text-[#0B192C] dark:text-white tracking-tight">
                                    {isArabic ? 'تسجيل حساب تجاري جديد' : 'Register Store Account'}
                                </h1>
                                <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 mt-1.5 leading-relaxed">
                                    {isArabic 
                                        ? 'املأ بيانات متجرك لتقديم طلب فتح حساب واعتماده من قبل إدارة المبيعات' 
                                        : 'Enter your business details to apply for a verified merchant account'}
                                </p>
                            </div>

                            {/* Error Alert */}
                            {error && (
                                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold text-center">
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <form className="space-y-3.5" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label htmlFor="reg-shopName" className="block text-xs font-bold text-[#0B192C] dark:text-slate-200 mb-1">
                                            {isArabic ? 'اسم المحل / السوبرماركت *' : 'Store Name *'}
                                        </label>
                                        <div className="relative rounded-xl">
                                            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
                                                <MdStore className="text-base" />
                                            </div>
                                            <input
                                                id="reg-shopName"
                                                type="text"
                                                name="shopName"
                                                required
                                                maxLength={100}
                                                value={formData.shopName}
                                                onChange={handleChange}
                                                placeholder={isArabic ? 'مثال: سوبرماركت الأمانة' : 'e.g. Al-Amana Market'}
                                                className="block w-full ps-9 pe-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8A6305] text-xs sm:text-sm font-medium transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="reg-ownerName" className="block text-xs font-bold text-[#0B192C] dark:text-slate-200 mb-1">
                                            {isArabic ? 'اسم صاحب الطلب / التاجر *' : 'Contact Person *'}
                                        </label>
                                        <div className="relative rounded-xl">
                                            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
                                                <MdPerson className="text-base" />
                                            </div>
                                            <input
                                                id="reg-ownerName"
                                                type="text"
                                                name="ownerName"
                                                required
                                                maxLength={100}
                                                value={formData.ownerName}
                                                onChange={handleChange}
                                                placeholder={isArabic ? 'محمد أحمد' : 'Mohammad Ahmad'}
                                                className="block w-full ps-9 pe-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8A6305] text-xs sm:text-sm font-medium transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label htmlFor="reg-phone" className="block text-xs font-bold text-[#0B192C] dark:text-slate-200 mb-1">
                                            {isArabic ? 'رقم الهاتف (الموبايل والواتساب) *' : 'Mobile / WhatsApp *'}
                                        </label>
                                        <div className="relative rounded-xl">
                                            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
                                                <MdPhone className="text-base" />
                                            </div>
                                            <input
                                                id="reg-phone"
                                                type="tel"
                                                name="phone"
                                                inputMode="tel"
                                                required
                                                maxLength={15}
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="09xxxxxxxx"
                                                dir="ltr"
                                                className="block w-full ps-9 pe-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8A6305] text-xs sm:text-sm font-medium transition-all font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="reg-city" className="block text-xs font-bold text-[#0B192C] dark:text-slate-200 mb-1">
                                            {isArabic ? 'المحافظة / المدينة *' : 'Governorate / City *'}
                                        </label>
                                        <div className="relative rounded-xl">
                                            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
                                                <MdLocationOn className="text-base" />
                                            </div>
                                            <select
                                                id="reg-city"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                className="block w-full ps-9 pe-8 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8A6305] text-xs sm:text-sm font-medium transition-all cursor-pointer appearance-none"
                                            >
                                                {SYRIAN_CITIES.map((c) => (
                                                    <option key={c} value={c} className="dark:bg-zinc-800">
                                                        {c}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 end-0 pe-2.5 flex items-center pointer-events-none text-slate-400">
                                                <MdExpandMore className="text-lg" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="reg-address" className="block text-xs font-bold text-[#0B192C] dark:text-slate-200 mb-1">
                                        {isArabic ? 'العنوان بالتفصيل (الحي / الشارع / نقطة علامة) *' : 'Detailed Address (Area / Street / Landmark) *'}
                                    </label>
                                    <input
                                        id="reg-address"
                                        type="text"
                                        name="address"
                                        required
                                        maxLength={300}
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder={isArabic ? 'اسم الحي / الشارع / نقطة علامة قريبة' : 'Area, street, nearby landmark'}
                                        className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8A6305] text-xs sm:text-sm font-medium transition-all"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="reg-password" className="block text-xs font-bold text-[#0B192C] dark:text-slate-200 mb-1">
                                        {isArabic ? 'كلمة المرور (6 خانات على الأقل) *' : 'Password (min 6 characters) *'}
                                    </label>
                                    <div className="relative rounded-xl">
                                        <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
                                            <MdLock className="text-base" />
                                        </div>
                                        <input
                                            id="reg-password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            required
                                            maxLength={64}
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="block w-full ps-9 pe-10 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8A6305] text-xs sm:text-sm font-medium transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 end-0 pe-3 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                                            aria-label={showPassword ? (isArabic ? "إخفاء كلمة المرور" : "Hide password") : (isArabic ? "إظهار كلمة المرور" : "Show password")}
                                        >
                                            {showPassword ? <MdVisibilityOff className="text-base" /> : <MdVisibility className="text-base" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 rounded-xl bg-[#0B192C] hover:bg-[#8A6305] dark:bg-[#8A6305] dark:hover:bg-[#725204] text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
                                >
                                    <span>{loading ? (isArabic ? 'جاري إرسال الطلب...' : 'Submitting Request...') : (isArabic ? 'إرسال طلب فتح حساب تجاري' : 'Submit Merchant Application')}</span>
                                    {!loading && <MdArrowForward className={`text-base ${isArabic ? 'rotate-180' : ''}`} />}
                                </button>
                            </form>
                        </div>

                        {/* Footer Link to Login */}
                        <div className="pt-4 mt-5 border-t border-slate-200/80 dark:border-white/10 text-center">
                            <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400">
                                {isArabic ? 'لديك حساب تجاري مفعل بالفعل؟' : 'Already have an active account?'}{' '}
                                <Link
                                    href="/account/login"
                                    className="font-bold text-[#8A6305] hover:text-[#735204] dark:text-[#E5B54A] hover:underline"
                                >
                                    {isArabic ? 'تسجيل الدخول هنا ←' : 'Sign in here →'}
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
