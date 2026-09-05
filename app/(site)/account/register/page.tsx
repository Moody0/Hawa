'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomer } from '@/app/context/CustomerContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { MdStore, MdPerson, MdPhone, MdLocationOn, MdLock, MdArrowForward } from 'react-icons/md';

const SYRIAN_CITIES = [
    'دمشق',
    'ريف دمشق',
    'حمص',
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
    const { language } = useLanguage();
    const isArabic = language === 'ar';

    const [formData, setFormData] = useState({
        shopName: '',
        ownerName: '',
        phone: '',
        city: 'حمص',
        address: '',
        password: '',
        notes: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        if (customer) {
            router.push('/account');
        }
    }, [customer, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const numeric = value.replace(/[^0-9]/g, '');
            setFormData((prev) => ({ ...prev, [name]: numeric }));
            return;
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.shopName.trim() || !formData.ownerName.trim() || !formData.phone.trim() || !formData.city.trim() || !formData.address.trim() || !formData.password) {
            setError(isArabic ? 'يرجى تعبئة جميع الحقول المطلوبة' : 'Please fill in all required fields');
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
            router.push('/account');
        } else {
            setError(res.error || (isArabic ? 'فشل إنشاء الحساب' : 'Registration failed'));
        }
    };

    return (
        <main className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAF6EC]/30 via-white to-gray-50 dark:from-[#0B192C]/50 dark:via-[#132035] dark:to-[#0B192C]">
            <div className="max-w-xl w-full space-y-6 bg-white dark:bg-[#132035] p-6 sm:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-white/10">
                {/* Header */}
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FAF6EC] dark:bg-white/5 border border-[#8A6305]/30 flex items-center justify-center mb-3">
                        <MdStore className="text-3xl text-[#8A6305] dark:text-[#8A6305]" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#0B192C] dark:text-white tracking-tight">
                        {isArabic ? 'تسجيل حساب تجاري جديد' : 'New Merchant Registration'}
                    </h1>
                    <p className="mt-1.5 text-xs sm:text-sm text-[#475569] dark:text-gray-400">
                        {isArabic 
                            ? 'سجل بيانات محلك التجاري لتسهيل طلبات الجملة وتتبعها وإعادة طلبها بضغطة زر' 
                            : 'Register your store for 1-click wholesale ordering, re-orders, and order tracking'}
                    </p>
                </div>

                {error && (
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold text-center">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                                {isArabic ? 'اسم المحل / المتجر *' : 'Shop / Store Name *'}
                            </label>
                            <div className="relative rounded-xl shadow-xs">
                                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-gray-400">
                                    <MdStore className="text-base" />
                                </div>
                                <input
                                    type="text"
                                    name="shopName"
                                    required
                                    value={formData.shopName}
                                    onChange={handleChange}
                                    placeholder={isArabic ? 'مثال: سوبرماركت الأمانة' : 'e.g. Al-Amana Supermarket'}
                                    className="block w-full ps-10 pe-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8A6305] text-xs sm:text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                                {isArabic ? 'اسم صاحب الطلب / المسؤول *' : 'Owner / Manager Name *'}
                            </label>
                            <div className="relative rounded-xl shadow-xs">
                                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-gray-400">
                                    <MdPerson className="text-base" />
                                </div>
                                <input
                                    type="text"
                                    name="ownerName"
                                    required
                                    value={formData.ownerName}
                                    onChange={handleChange}
                                    placeholder={isArabic ? 'محمد أحمد' : 'Mohammad Ahmad'}
                                    className="block w-full ps-10 pe-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8A6305] text-xs sm:text-sm font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                                {isArabic ? 'رقم الهاتف للتواصل والواتساب *' : 'Mobile / WhatsApp *'}
                            </label>
                            <div className="relative rounded-xl shadow-xs">
                                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-gray-400">
                                    <MdPhone className="text-base" />
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="09xxxxxxxx"
                                    dir="ltr"
                                    className="block w-full ps-10 pe-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8A6305] text-xs sm:text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                                {isArabic ? 'المحافظة / المنطقة *' : 'Governorate / Region *'}
                            </label>
                            <div className="relative rounded-xl shadow-xs">
                                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-gray-400">
                                    <MdLocationOn className="text-base" />
                                </div>
                                <select
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="block w-full ps-10 pe-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8A6305] text-xs sm:text-sm font-medium"
                                >
                                    {SYRIAN_CITIES.map((c) => (
                                        <option key={c} value={c} className="dark:bg-zinc-800">
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                            {isArabic ? 'العنوان بالتفصيل (اسم الحي / الشارع / علامة مميزة) *' : 'Detailed Address (Street / Area / Landmark) *'}
                        </label>
                        <input
                            type="text"
                            name="address"
                            required
                            value={formData.address}
                            onChange={handleChange}
                            placeholder={isArabic ? 'مثال: حي الإنشاءات - شارع البرازيل - قرب مدرسة...' : 'Detailed delivery location'}
                            className="block w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8A6305] text-xs sm:text-sm font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                            {isArabic ? 'كلمة المرور (6 أحرف أو أرقام على الأقل) *' : 'Password (min 6 chars) *'}
                        </label>
                        <div className="relative rounded-xl shadow-xs">
                            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-gray-400">
                                <MdLock className="text-base" />
                            </div>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="block w-full ps-10 pe-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8A6305] text-xs sm:text-sm font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                            {isArabic ? 'ملاحظات إضافية (أوقات استلام الطرود، الخ)' : 'Additional Notes (Delivery timings, etc.)'}
                        </label>
                        <textarea
                            name="notes"
                            rows={2}
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder={isArabic ? 'مثال: يفضل التوصيل في الفترة الصباحية' : 'Any delivery preferences'}
                            className="block w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8A6305] text-xs sm:text-sm font-medium"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 rounded-xl bg-[#0B192C] hover:bg-[#1e293b] dark:bg-[#8A6305] dark:hover:bg-[#725204] text-white dark:text-white font-extrabold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
                    >
                        <span>{loading ? (isArabic ? 'جاري إنشاء الحساب...' : 'Creating account...') : (isArabic ? 'إنشاء حساب تجاري' : 'Register Store')}</span>
                        {!loading && <MdArrowForward className={`text-base ${isArabic ? 'rotate-180' : ''}`} />}
                    </button>
                </form>

                <div className="pt-3 border-t border-gray-100 dark:border-white/10 text-center">
                    <p className="text-xs text-[#475569] dark:text-gray-400">
                        {isArabic ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
                        <Link
                            href="/account/login"
                            className="font-bold text-[#8A6305] dark:text-[#8A6305] hover:underline"
                        >
                            {isArabic ? 'تسجيل الدخول هنا' : 'Sign in here'}
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
