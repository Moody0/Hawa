'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomer } from '@/app/context/CustomerContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { MdStore, MdLock, MdPhone, MdArrowForward } from 'react-icons/md';

export default function MerchantLoginPage() {
    const router = useRouter();
    const { login, customer } = useCustomer();
    const { language } = useLanguage();
    const isArabic = language === 'ar';

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If already logged in, redirect to portal
    React.useEffect(() => {
        if (customer) {
            router.push('/account');
        }
    }, [customer, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!phone.trim() || !password) {
            setError(isArabic ? 'يرجى إدخال رقم الهاتف وكلمة المرور' : 'Please enter your phone number and password');
            return;
        }

        setLoading(true);
        const res = await login(phone, password);
        setLoading(false);

        if (res.success) {
            router.push('/account');
        } else {
            setError(res.error || (isArabic ? 'فشل تسجيل الدخول' : 'Login failed'));
        }
    };

    return (
        <main className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAF6EC]/30 via-white to-gray-50 dark:from-[#0B192C]/50 dark:via-[#132035] dark:to-[#0B192C]">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#132035] p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-white/10">
                {/* Header */}
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FAF6EC] dark:bg-white/5 border border-[#8A6305]/30 flex items-center justify-center mb-4">
                        <MdStore className="text-3xl text-[#8A6305] dark:text-[#8A6305]" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#0B192C] dark:text-white tracking-tight">
                        {isArabic ? 'تسجيل دخول التاجر' : 'Merchant Portal Login'}
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-[#475569] dark:text-gray-400">
                        {isArabic 
                            ? 'أهلاً بك في بوابة أصحاب المحلات والمتاجر لشركة هوا للتوزيع' 
                            : 'Access your commercial orders, re-orders, and saved agency products'}
                    </p>
                </div>

                {error && (
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold text-center animate-shake">
                        {error}
                    </div>
                )}

                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1.5">
                            {isArabic ? 'رقم الهاتف (الموبايل)' : 'Phone Number'}
                        </label>
                        <div className="relative rounded-xl shadow-xs">
                            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-gray-400">
                                <MdPhone className="text-lg" />
                            </div>
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="09xxxxxxxx"
                                dir="ltr"
                                className="block w-full ps-11 pe-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8A6305] text-sm font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1.5">
                            {isArabic ? 'كلمة المرور' : 'Password'}
                        </label>
                        <div className="relative rounded-xl shadow-xs">
                            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-gray-400">
                                <MdLock className="text-lg" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="block w-full ps-11 pe-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8A6305] text-sm font-medium"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 rounded-xl bg-[#0B192C] hover:bg-[#1e293b] dark:bg-[#8A6305] dark:hover:bg-[#725204] text-white dark:text-white font-extrabold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                        <span>{loading ? (isArabic ? 'جاري التحقق...' : 'Signing in...') : (isArabic ? 'تسجيل الدخول' : 'Sign In')}</span>
                        {!loading && <MdArrowForward className={`text-base ${isArabic ? 'rotate-180' : ''}`} />}
                    </button>
                </form>

                {/* Footer link to register */}
                <div className="pt-4 border-t border-gray-100 dark:border-white/10 text-center">
                    <p className="text-xs text-[#475569] dark:text-gray-400">
                        {isArabic ? 'ليس لديك حساب تجاري بعد؟' : "Don't have a merchant account yet?"}{' '}
                        <Link
                            href="/account/register"
                            className="font-bold text-[#8A6305] dark:text-[#8A6305] hover:underline"
                        >
                            {isArabic ? 'سجّل محلك الآن' : 'Register your store now'}
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
