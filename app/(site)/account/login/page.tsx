'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomer } from '@/app/context/CustomerContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { 
    MdPhone, 
    MdLock, 
    MdVisibility, 
    MdVisibilityOff, 
    MdArrowForward,
    MdCheckCircle,
    MdSupportAgent,
    MdHelpOutline
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';

export default function MerchantLoginPage() {
    const router = useRouter();
    const { login, customer } = useCustomer();
    const { language, dir } = useLanguage();
    const isArabic = language === 'ar' || dir === 'rtl';

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingAccount, setPendingAccount] = useState<{ shopName?: string; phone: string } | null>(null);
    const [showForgotModal, setShowForgotModal] = useState(false);

    const SALES_MANAGER_PHONE = '+963 993 443 901';
    const SALES_MANAGER_CLEAN = '963993443901';

    // If already logged in, redirect to portal
    React.useEffect(() => {
        if (customer) {
            router.push('/account');
        }
    }, [customer, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setPendingAccount(null);

        const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
        if (!cleanPhone || !password) {
            setError(isArabic ? 'يرجى إدخال رقم الهاتف وكلمة المرور' : 'Please enter your phone number and password');
            return;
        }

        setLoading(true);
        const res = await login(cleanPhone, password);
        setLoading(false);

        if (res.success) {
            router.push('/account');
        } else if (res.isPending) {
            setPendingAccount({
                shopName: res.shopName,
                phone: cleanPhone,
            });
            setError(res.error || null);
        } else {
            setError(res.error || (isArabic ? 'رقم الهاتف أو كلمة المرور غير صحيحة' : 'Invalid phone number or password'));
        }
    };

    return (
        <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center py-8 md:py-14 bg-slate-50/70 dark:bg-[#0B192C]/40">
            <div className="container-custom max-w-4xl w-full">
                {/* Main Card: Split Panel Layout */}
                <div className="bg-white dark:bg-[#132035] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                    
                    {/* Panel 1: Merchant Benefits & Trust (Hidden on mobile, 5 cols on desktop) */}
                    <div className="hidden lg:flex lg:col-span-5 bg-[#FAF6EC] dark:bg-[#0E1A29] p-6 sm:p-8 flex-col justify-between border-b lg:border-b-0 lg:border-e border-slate-200/80 dark:border-white/10">
                        <div>
                            {/* Brand Emblem & Badge */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-amber-100 dark:bg-amber-950/50 text-[#8A6305] dark:text-[#E5B54A] border border-[#8A6305]/20 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                    {isArabic ? 'بوابة التجار المعتمدة' : 'Merchant Portal'}
                                </span>
                            </div>

                            <h2 className="text-xl sm:text-2xl font-black text-[#0B192C] dark:text-white tracking-tight leading-snug mb-2">
                                {isArabic ? 'كل منتجات وكالاتك... بطلب واحد' : 'Your FMCG Agencies in One Order'}
                            </h2>

                            <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 mb-6 leading-relaxed">
                                {isArabic 
                                    ? 'سجّل دخولك للوصول إلى لوحة المشتريات الخاصة بمحلك التجاري والاطلاع على أسعار الجملة الرسمية.'
                                    : 'Sign in to access your wholesale store dashboard, price lists, and order history.'}
                            </p>

                            {/* Wholesale Benefits List */}
                            <div className="space-y-3.5 mb-6">
                                <div className="flex items-start gap-2.5">
                                    <MdCheckCircle className="text-[#8A6305] text-lg shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white">
                                            {isArabic ? 'الاطلاع على أسعار الجملة' : 'Live Wholesale Prices'}
                                        </h4>
                                        <p className="text-[11px] text-[#475569] dark:text-slate-400">
                                            {isArabic ? 'كشوف أسعار الطرود والتخفيضات المعتمدة لكافة الوكالات' : 'Official carton prices and quantity volume discounts'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <MdCheckCircle className="text-[#8A6305] text-lg shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white">
                                            {isArabic ? 'سجل الفواتير وتتبع الشحن' : 'Invoices & Tracking'}
                                        </h4>
                                        <p className="text-[11px] text-[#475569] dark:text-slate-400">
                                            {isArabic ? 'أرشيف كامل بحركة مشتريات محلك ومواعيد تسليم البضاعة' : 'Full order history and scheduled fleet delivery statuses'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <MdCheckCircle className="text-[#8A6305] text-lg shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white">
                                            {isArabic ? 'إعادة الطلب السريع' : '1-Click Quick Re-Order'}
                                        </h4>
                                        <p className="text-[11px] text-[#475569] dark:text-slate-400">
                                            {isArabic ? 'إعادة طلب بضاعة المحل دورياً دون الحاجة لإعادة الإدخال' : 'Replenish your store stock with pre-saved preferences'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Direct Sales Support Box */}
                        <div className="pt-4 border-t border-slate-200/80 dark:border-white/10">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 text-[#475569] dark:text-slate-400">
                                    <MdSupportAgent className="text-base text-[#8A6305]" />
                                    <span>{isArabic ? 'مدير المبيعات المباشر:' : 'Sales Manager:'}</span>
                                </div>
                                <a 
                                    href={`https://wa.me/${SALES_MANAGER_CLEAN}?text=${encodeURIComponent(isArabic ? 'مرحباً، أحتاج مساعدة في حساب التاجر لدى شركة حوا' : 'Hello, I need assistance with my Hawa merchant account')}`}
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

                    {/* Panel 2: The Login Form (7 cols on desktop) */}
                    <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
                        <div>
                            {/* Form Header */}
                            <div className="mb-6">
                                <h1 className="text-xl sm:text-2xl font-black text-[#0B192C] dark:text-white tracking-tight">
                                    {isArabic ? 'تسجيل دخول التاجر' : 'Merchant Sign In'}
                                </h1>
                                <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 mt-1">
                                    {isArabic 
                                        ? 'أدخل رقم الهاتف المسجل وكلمة المرور للمتابعة' 
                                        : 'Enter your registered phone number and password'}
                                </p>
                            </div>

                            {/* Pending Account Alert */}
                            {pendingAccount && (
                                <div className="mb-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-start space-y-2">
                                    <div className="flex items-center gap-2 text-[#8A6305] dark:text-[#E5B54A] font-bold text-xs sm:text-sm">
                                        <span className="w-2 h-2 rounded-full bg-[#8A6305] animate-ping" />
                                        <span>{isArabic ? 'حسابك التجاري قيد المراجعة والتدقيق' : 'Account Under Review'}</span>
                                    </div>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                        {isArabic 
                                            ? `طلبك قيد التحقق من قبل إدارة مبيعات شركة حوا. يمكنك التواصل مباشرة مع مدير المبيعات لتسريع التفعيل.`
                                            : 'Your application is being verified by sales management. Contact sales directly to expedite activation.'}
                                    </p>
                                    <a
                                        href={`https://wa.me/${SALES_MANAGER_CLEAN}?text=${encodeURIComponent(
                                            `مرحباً، أتابع حالة حسابي التجاري (${pendingAccount.shopName || ''}) المسجل برقم (${pendingAccount.phone})، وأرغب في مراجعة وتفعيل الحساب.`
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-xs transition-all active:scale-95 mt-1"
                                    >
                                        <FaWhatsapp className="text-sm" />
                                        <span>{isArabic ? 'تواصل مع مدير المبيعات لتسريع التفعيل' : 'Contact Sales to Expedite'}</span>
                                    </a>
                                </div>
                            )}

                            {/* Regular Error Alert (if not pending) */}
                            {error && !pendingAccount && (
                                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold text-center">
                                    {error}
                                </div>
                            )}

                            {/* Login Form */}
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                {/* Phone Input */}
                                <div>
                                    <label htmlFor="login-phone" className="block text-xs font-bold text-[#0B192C] dark:text-slate-200 mb-1.5">
                                        {isArabic ? 'رقم الهاتف (الموبايل)' : 'Phone Number'}
                                    </label>
                                    <div className="relative rounded-xl">
                                        <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                                            <MdPhone className="text-base" />
                                        </div>
                                        <input
                                            id="login-phone"
                                            type="tel"
                                            inputMode="tel"
                                            required
                                            maxLength={15}
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="09xxxxxxxx"
                                            dir="ltr"
                                            className="block w-full ps-10 pe-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8A6305] text-xs sm:text-sm font-medium transition-all font-mono"
                                        />
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label htmlFor="login-password" className="block text-xs font-bold text-[#0B192C] dark:text-slate-200">
                                            {isArabic ? 'كلمة المرور' : 'Password'}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowForgotModal(true)}
                                            className="text-xs font-bold text-[#8A6305] hover:text-[#735204] dark:text-[#E5B54A] hover:underline cursor-pointer"
                                        >
                                            {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                                        </button>
                                    </div>
                                    <div className="relative rounded-xl">
                                        <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                                            <MdLock className="text-base" />
                                        </div>
                                        <input
                                            id="login-password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            maxLength={64}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="block w-full ps-10 pe-11 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8A6305] text-xs sm:text-sm font-medium transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                                            aria-label={showPassword ? (isArabic ? "إخفاء كلمة المرور" : "Hide password") : (isArabic ? "إظهار كلمة المرور" : "Show password")}
                                        >
                                            {showPassword ? <MdVisibilityOff className="text-lg" /> : <MdVisibility className="text-lg" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 rounded-xl bg-[#0B192C] hover:bg-[#8A6305] dark:bg-[#8A6305] dark:hover:bg-[#735204] text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
                                >
                                    <span>{loading ? (isArabic ? 'جاري التحقق...' : 'Signing in...') : (isArabic ? 'تسجيل الدخول' : 'Sign In')}</span>
                                    {!loading && <MdArrowForward className={`text-base ${isArabic ? 'rotate-180' : ''}`} />}
                                </button>
                            </form>

                            {/* Guest Ordering Reassurance */}
                            <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-white/5 flex items-start gap-2 text-[11px] text-[#475569] dark:text-slate-400">
                                <MdHelpOutline className="text-sm text-[#8A6305] shrink-0 mt-0.5" />
                                <p className="leading-relaxed">
                                    {isArabic 
                                        ? 'يمكنك دائماً تصفح المنتجات والطلب كزائر مباشرة، تسجيل الدخول مخصص للاطلاع على أسعار الجملة المعتمدة.'
                                        : 'You can browse and order as a guest anytime. Logging in unlocks official wholesale price lists.'}
                                </p>
                            </div>
                        </div>

                        {/* Footer: Link to Register */}
                        <div className="pt-6 mt-6 border-t border-slate-200/80 dark:border-white/10 text-center">
                            <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400">
                                {isArabic ? 'ليس لديك حساب تجاري بعد؟' : "Don't have a merchant account yet?"}{' '}
                                <Link
                                    href="/account/register"
                                    className="font-bold text-[#8A6305] hover:text-[#735204] dark:text-[#E5B54A] hover:underline"
                                >
                                    {isArabic ? 'سجّل محلك التجاري الآن ←' : 'Register your store now →'}
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
                    onClick={() => setShowForgotModal(false)}
                >
                    <div 
                        className="bg-white dark:bg-[#132035] rounded-2xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-white/10 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/50 text-[#8A6305] flex items-center justify-center mx-auto mb-4 text-2xl">
                            <MdSupportAgent />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-[#0B192C] dark:text-white text-center mb-2">
                            {isArabic ? 'استعادة كلمة المرور للحساب التجاري' : 'Merchant Password Recovery'}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-300 text-center leading-relaxed mb-6">
                            {isArabic 
                                ? 'لأمان حسابات المحلات التجارية، يتم إعادة تعيين كلمة المرور مباشرة عبر التواصل مع إدارة المبيعات على واتساب.'
                                : 'For security, password resets are processed directly via WhatsApp support with sales management.'}
                        </p>

                        <div className="space-y-2.5">
                            <a
                                href={`https://wa.me/${SALES_MANAGER_CLEAN}?text=${encodeURIComponent(isArabic ? 'مرحباً، نسيت كلمة المرور الخاصة بحسابي التجاري لدى شركة حوا وأرغب في استعادتها.' : 'Hello, I forgot my merchant account password and need to reset it.')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-2.5 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
                            >
                                <FaWhatsapp className="text-base" />
                                <span>{isArabic ? 'تواصل مع مدير المبيعات عبر واتساب' : 'Contact Sales on WhatsApp'}</span>
                            </a>
                            <button
                                type="button"
                                onClick={() => setShowForgotModal(false)}
                                className="w-full py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0B192C] dark:text-white font-bold text-xs transition-colors cursor-pointer"
                            >
                                {isArabic ? 'إغلاق' : 'Close'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
