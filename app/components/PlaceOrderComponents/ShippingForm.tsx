"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { ArrowLeft, ChevronDown, Store, User, Phone, MapPin, Home, CheckCircle2, AlertCircle, FileEdit, RotateCw, Send, Clock3 } from 'lucide-react';
import { SYRIAN_GOVERNORATES, isValidSyrianPhone } from '@/lib/order-validation';

export interface ShippingFormData {
    shopName: string;
    ownerName: string;
    phone: string;
    streetAddress: string;
    city: string;
    notes: string;
}

export interface ShippingFormErrors {
    shopName?: string;
    ownerName?: string;
    phone?: string;
    streetAddress?: string;
    city?: string;
    notes?: string;
}

export interface SubmissionFeedback {
    category: 'validation' | 'network' | 'session' | 'stock' | 'server';
    message: string;
    details?: string;
}

interface ShippingFormProps {
    formData: ShippingFormData;
    errors?: ShippingFormErrors;
    touched?: Record<string, boolean>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleBlur?: (field: keyof ShippingFormData) => void;
    loading: boolean;
    itemsCount: number;
    isQuoteRequest: boolean;
    submissionFeedback?: SubmissionFeedback | null;
}

const ShippingForm = ({
    formData,
    errors = {},
    touched = {},
    handleInputChange,
    handleBlur,
    loading,
    itemsCount,
    isQuoteRequest,
    submissionFeedback = null,
}: ShippingFormProps) => {
    const { t, dir, language } = useLanguage();
    const isAr = language === 'ar' || dir === 'rtl';

    const isPhoneValid = isValidSyrianPhone(formData.phone);
    const showPhoneError = Boolean(touched.phone && errors.phone);
    const showPhoneSuccess = formData.phone.length === 10 && isPhoneValid;

    const onFieldBlur = (field: keyof ShippingFormData) => {
        if (handleBlur) {
            handleBlur(field);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 md:p-8 dark:border-white/10 dark:bg-zinc-900">
                <div className="flex items-center gap-2 pb-4 mb-5 border-b border-gray-100 dark:border-white/5">
                    <Store className="text-xl text-[#8A6305]" />
                    <h2 className="text-sm font-extrabold text-[#0B192C] dark:text-white uppercase tracking-wider">
                        {isAr ? 'بيانات المحل والتوصيل' : 'Store & Delivery Details'}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Store / Shop Name */}
                    <div className="col-span-1 md:col-span-2">
                        <label 
                            htmlFor="field-shopName"
                            className="block text-xs font-bold mb-1.5 text-[#0B192C] dark:text-white uppercase tracking-wider"
                        >
                            {t('checkout.shopName')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-gray-400">
                                <Store className="text-base" />
                            </div>
                            <input
                                id="field-shopName"
                                name="shopName"
                                value={formData.shopName}
                                onChange={handleInputChange}
                                onBlur={() => onFieldBlur('shopName')}
                                required
                                maxLength={100}
                                autoComplete="organization"
                                aria-invalid={Boolean(touched.shopName && errors.shopName)}
                                aria-describedby={touched.shopName && errors.shopName ? "error-shopName" : undefined}
                                className={`w-full rounded-lg border bg-white py-3 ps-10 pe-4 text-sm font-medium text-[#0B192C] outline-none transition-colors placeholder:text-slate-400 dark:bg-zinc-800 dark:text-white ${
                                    touched.shopName && errors.shopName
                                        ? 'border-red-500 focus:border-red-500 focus:ring-0 bg-red-50/20 dark:bg-red-950/10'
                                        : 'border-slate-300 dark:border-white/15 focus:border-[#8A6305] focus:ring-0'
                                }`}
                                placeholder={t('checkout.shopNamePlaceholder')}
                                type="text"
                            />
                        </div>
                        {touched.shopName && errors.shopName && (
                            <p id="error-shopName" className="flex items-center gap-1 text-xs text-red-500 font-bold mt-1.5">
                                <AlertCircle className="text-sm shrink-0" />
                                <span>{errors.shopName}</span>
                            </p>
                        )}
                    </div>

                    {/* Owner / Contact Person */}
                    <div className="col-span-1">
                        <label 
                            htmlFor="field-ownerName"
                            className="block text-xs font-bold mb-1.5 text-[#0B192C] dark:text-white uppercase tracking-wider"
                        >
                            {t('checkout.ownerName')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-gray-400">
                                <User className="text-base" />
                            </div>
                            <input
                                id="field-ownerName"
                                name="ownerName"
                                value={formData.ownerName}
                                onChange={handleInputChange}
                                onBlur={() => onFieldBlur('ownerName')}
                                required
                                maxLength={100}
                                autoComplete="name"
                                aria-invalid={Boolean(touched.ownerName && errors.ownerName)}
                                aria-describedby={touched.ownerName && errors.ownerName ? "error-ownerName" : undefined}
                                className={`w-full rounded-lg border bg-white py-3 ps-10 pe-4 text-sm font-medium text-[#0B192C] outline-none transition-colors placeholder:text-slate-400 dark:bg-zinc-800 dark:text-white ${
                                    touched.ownerName && errors.ownerName
                                        ? 'border-red-500 focus:border-red-500 focus:ring-0 bg-red-50/20 dark:bg-red-950/10'
                                        : 'border-slate-300 dark:border-white/15 focus:border-[#8A6305] focus:ring-0'
                                }`}
                                placeholder={t('checkout.ownerNamePlaceholder')}
                                type="text"
                            />
                        </div>
                        {touched.ownerName && errors.ownerName && (
                            <p id="error-ownerName" className="flex items-center gap-1 text-xs text-red-500 font-bold mt-1.5">
                                <AlertCircle className="text-sm shrink-0" />
                                <span>{errors.ownerName}</span>
                            </p>
                        )}
                    </div>

                    {/* WhatsApp Mobile Number */}
                    <div className="col-span-1">
                        <label 
                            htmlFor="field-phone"
                            className="block text-xs font-bold mb-1.5 text-[#0B192C] dark:text-white uppercase tracking-wider"
                        >
                            {t('checkout.phoneNumber')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-gray-400">
                                <Phone className="text-base" />
                            </div>
                            <input
                                id="field-phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                onBlur={() => onFieldBlur('phone')}
                                required
                                autoComplete="tel"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={10}
                                aria-invalid={showPhoneError}
                                aria-describedby="phone-hint"
                                className={`w-full rounded-lg border bg-white py-3 ps-10 pe-10 text-sm font-mono font-medium text-[#0B192C] outline-none transition-colors placeholder:text-slate-400 dark:bg-zinc-800 dark:text-white ${
                                    showPhoneError
                                        ? 'border-red-500 focus:border-red-500 focus:ring-0 bg-red-50/20 dark:bg-red-950/10'
                                        : showPhoneSuccess
                                        ? 'border-emerald-500 focus:border-emerald-500 focus:ring-0'
                                        : 'border-slate-300 dark:border-white/15 focus:border-[#8A6305] focus:ring-0'
                                }`}
                                placeholder="09xxxxxxxx"
                                type="tel"
                                dir="ltr"
                            />
                            {showPhoneSuccess && (
                                <div className="absolute inset-y-0 end-0 pe-3.5 flex items-center pointer-events-none text-emerald-500">
                                    <CheckCircle2 className="text-lg" />
                                </div>
                            )}
                        </div>
                        {showPhoneError ? (
                            <p id="phone-hint" className="flex items-center gap-1 text-xs text-red-500 font-bold mt-1.5">
                                <AlertCircle className="text-sm shrink-0" />
                                <span>{errors.phone}</span>
                            </p>
                        ) : (
                            <p id="phone-hint" className="text-xs text-gray-400 dark:text-slate-400 mt-1.5 font-medium">
                                {isAr 
                                    ? 'يجب أن يبدأ بـ 09 ويتكون من 10 أرقام (لتلقي تفاصيل الطلب عبر واتساب)' 
                                    : 'Must start with 09 and be 10 digits (for WhatsApp order confirmation)'}
                            </p>
                        )}
                    </div>

                    {/* City / Governorate */}
                    <div className="col-span-1 md:col-span-2">
                        <label 
                            htmlFor="field-city"
                            className="block text-xs font-bold mb-1.5 text-[#0B192C] dark:text-white uppercase tracking-wider"
                        >
                            {t('checkout.city')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-gray-400">
                                <MapPin className="text-base" />
                            </div>
                            <select
                                id="field-city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                onBlur={() => onFieldBlur('city')}
                                required
                                aria-invalid={Boolean(touched.city && errors.city)}
                                aria-describedby={touched.city && errors.city ? "error-city" : undefined}
                                className={`w-full cursor-pointer appearance-none rounded-lg border bg-white py-3 ps-10 pe-10 text-sm font-medium text-[#0B192C] outline-none transition-colors dark:bg-zinc-800 dark:text-white ${
                                    touched.city && errors.city
                                        ? 'border-red-500 focus:border-red-500 focus:ring-0 bg-red-50/20 dark:bg-red-950/10'
                                        : 'border-slate-300 dark:border-white/15 focus:border-[#8A6305] focus:ring-0'
                                }`}
                            >
                                <option value="" className="bg-white dark:bg-zinc-900">
                                    {isAr ? '-- اختر المحافظة / المنطقة --' : '-- Select City / Governorate --'}
                                </option>
                                {SYRIAN_GOVERNORATES.map((gov) => (
                                    <option 
                                        key={gov.key} 
                                        value={gov.key} 
                                        className="bg-white dark:bg-zinc-900 font-medium"
                                    >
                                        {isAr ? gov.ar : gov.en}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 end-3 flex items-center pointer-events-none text-gray-400">
                                <ChevronDown className="text-xl" />
                            </div>
                        </div>
                        {touched.city && errors.city && (
                            <p id="error-city" className="flex items-center gap-1 text-xs text-red-500 font-bold mt-1.5">
                                <AlertCircle className="text-sm shrink-0" />
                                <span>{errors.city}</span>
                            </p>
                        )}
                    </div>

                    {/* Street Address */}
                    <div className="col-span-1 md:col-span-2">
                        <label 
                            htmlFor="field-streetAddress"
                            className="block text-xs font-bold mb-1.5 text-[#0B192C] dark:text-white uppercase tracking-wider"
                        >
                            {t('checkout.streetAddress')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-gray-400">
                                <Home className="text-base" />
                            </div>
                            <input
                                id="field-streetAddress"
                                name="streetAddress"
                                value={formData.streetAddress}
                                onChange={handleInputChange}
                                onBlur={() => onFieldBlur('streetAddress')}
                                autoComplete="street-address"
                                required
                                maxLength={250}
                                aria-invalid={Boolean(touched.streetAddress && errors.streetAddress)}
                                aria-describedby={touched.streetAddress && errors.streetAddress ? "error-streetAddress" : undefined}
                                className={`w-full rounded-lg border bg-white py-3 ps-10 pe-4 text-sm font-medium text-[#0B192C] outline-none transition-colors placeholder:text-slate-400 dark:bg-zinc-800 dark:text-white ${
                                    touched.streetAddress && errors.streetAddress
                                        ? 'border-red-500 focus:border-red-500 focus:ring-0 bg-red-50/20 dark:bg-red-950/10'
                                        : 'border-slate-300 dark:border-white/15 focus:border-[#8A6305] focus:ring-0'
                                }`}
                                placeholder={isAr ? 'مثال: حي الإنشاءات، شارع الجمهورية، بجانب صيدلية الأمل' : 'e.g. Inshaat District, Al-Jumhouriya Street, near Al-Amal Pharmacy'}
                                type="text"
                            />
                        </div>
                        {touched.streetAddress && errors.streetAddress && (
                            <p id="error-streetAddress" className="flex items-center gap-1 text-xs text-red-500 font-bold mt-1.5">
                                <AlertCircle className="text-sm shrink-0" />
                                <span>{errors.streetAddress}</span>
                            </p>
                        )}
                    </div>

                    {/* Delivery Notes */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center justify-between mb-1.5">
                            <label 
                                htmlFor="field-notes"
                                className="block text-xs font-bold text-[#0B192C] dark:text-white uppercase tracking-wider"
                            >
                                {t('checkout.notes')} <span className="text-gray-400 text-[11px] font-normal">({isAr ? 'اختياري' : 'Optional'})</span>
                            </label>
                            <span className="text-[11px] font-medium text-gray-400 dark:text-slate-400">
                                {formData.notes.length}/500
                            </span>
                        </div>
                        <div className="relative">
                            <div className="absolute top-3.5 start-3.5 pointer-events-none text-gray-400">
                                <FileEdit className="text-base" />
                            </div>
                            <textarea
                                id="field-notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                onBlur={() => onFieldBlur('notes')}
                                maxLength={500}
                                rows={3}
                                className="w-full resize-none rounded-lg border border-slate-300 bg-white py-3 ps-10 pe-4 text-sm font-medium text-[#0B192C] outline-none transition-colors placeholder:text-slate-400 focus:border-[#8A6305] focus:ring-0 dark:border-white/15 dark:bg-zinc-800 dark:text-white"
                                placeholder={t('checkout.notesPlaceholder')}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-7 border-t border-slate-200 pt-6 dark:border-white/10">
                    {submissionFeedback && (
                        <div
                            role="alert"
                            aria-live="assertive"
                            className={`mb-4 p-4 rounded-lg border text-xs sm:text-sm flex flex-col gap-1.5 ${
                                submissionFeedback.category === 'session'
                                    ? 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-700/50 dark:text-amber-200'
                                    : submissionFeedback.category === 'stock'
                                    ? 'bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/40 dark:border-rose-700/50 dark:text-rose-200'
                                    : submissionFeedback.category === 'network'
                                    ? 'bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-950/40 dark:border-blue-700/50 dark:text-blue-200'
                                    : submissionFeedback.category === 'validation'
                                    ? 'bg-red-50 border-red-300 text-red-900 dark:bg-red-950/40 dark:border-red-700/50 dark:text-red-200'
                                    : 'bg-slate-50 border-slate-300 text-slate-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-slate-200'
                            }`}
                        >
                            <div className="flex items-center gap-2 font-bold">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>
                                    {submissionFeedback.category === 'network'
                                        ? (isAr ? 'تعذر الاتصال بالشبكة' : 'Network Connection Issue')
                                        : submissionFeedback.category === 'session'
                                        ? (isAr ? 'جلسة الحساب غير نشطة' : 'Session Expired')
                                        : submissionFeedback.category === 'stock'
                                        ? (isAr ? 'تنبيه توفر المخزون' : 'Stock Availability Alert')
                                        : submissionFeedback.category === 'validation'
                                        ? (isAr ? 'يرجى تدقيق البيانات المدخلة' : 'Validation Error')
                                        : (isAr ? 'خطأ مؤقت في المعالجة' : 'Temporary Processing Error')}
                                </span>
                            </div>
                            <p className="leading-relaxed opacity-95">
                                {submissionFeedback.message}
                            </p>
                            {submissionFeedback.category === 'session' && (
                                <Link
                                    href="/account/login"
                                    className="mt-1 font-bold underline underline-offset-4 text-amber-800 dark:text-amber-300 hover:opacity-80"
                                >
                                    {isAr ? 'تسجيل الدخول إلى حسابك التجاري ←' : 'Log in to your merchant account →'}
                                </Link>
                            )}
                            {submissionFeedback.category === 'stock' && (
                                <Link
                                    href="/cart"
                                    className="mt-1 font-bold underline underline-offset-4 text-rose-800 dark:text-rose-300 hover:opacity-80"
                                >
                                    {isAr ? 'العودة لتعديل الكميات في السلة ←' : 'Return to cart to adjust quantities →'}
                                </Link>
                            )}
                            {(submissionFeedback.category === 'network' || submissionFeedback.category === 'server') && (
                                <p className="mt-0.5 text-[11px] opacity-75">
                                    {isAr
                                        ? 'بياناتك المدخلة محفوظة بالكامل، ويمكنك الضغط على زر الإرسال لإعادة المحاولة بأمان دون تكرار الطلب.'
                                        : 'Your entered details are completely preserved. You can safely retry without duplicating the order.'}
                                </p>
                            )}
                        </div>
                    )}
                    <div className="mb-4 flex items-start gap-3 border-s-2 border-[#8A6305] bg-[#F8FAFC] px-4 py-3 dark:bg-white/5">
                        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#8A6305]" aria-hidden="true" />
                        <div>
                            <p className="text-xs font-bold text-[#0B192C] dark:text-white">
                                {isQuoteRequest
                                    ? (isAr ? 'ماذا يحدث بعد الإرسال؟' : 'What happens after submission?')
                                    : (isAr ? 'مراجعة أخيرة قبل التأكيد' : 'Final review before confirmation')}
                            </p>
                            <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                                {isQuoteRequest
                                    ? (isAr
                                        ? 'سيتواصل معك فريق المبيعات خلال ساعات العمل لتأكيد السعر والتوصيل وترتيبات الدفع.'
                                        : 'Our sales team will contact you during business hours to confirm pricing, delivery, and payment terms.')
                                    : (isAr
                                        ? 'سيُسجل الطلب بالقيمة الظاهرة، ويتواصل معك الفريق لتأكيد موعد التوصيل.'
                                        : 'The order will be recorded at the displayed value, and our team will confirm the delivery schedule.')}
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || itemsCount === 0}
                        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0B192C] px-5 text-sm font-bold text-white transition-colors hover:bg-[#8A6305] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#FAF6EC] dark:text-[#0B192C] dark:hover:bg-[#8A6305] dark:hover:text-white"
                    >
                        {loading ? (
                            <RotateCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : isQuoteRequest ? (
                            <Send className="h-4 w-4" aria-hidden="true" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        )}
                        <span>
                            {loading
                                ? (isAr ? 'جارٍ الإرسال...' : 'Sending...')
                                : isQuoteRequest
                                    ? (isAr ? 'إرسال طلب الجملة' : 'Send Wholesale Request')
                                    : (isAr ? 'تأكيد الطلب' : 'Confirm Order')}
                        </span>
                    </button>
                    <p className="mt-2 text-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {isAr ? 'لا يتم تحصيل أو خصم أي دفعة إلكترونياً الآن' : 'No online payment is collected or charged now'}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between mt-2 px-1">
                <Link className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#475569] hover:text-[#0B192C] dark:hover:text-[#8A6305] transition-colors" href="/cart">
                    <ArrowLeft className={`text-sm ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                    {t('common.returnToCart')}
                </Link>
            </div>
        </div>
    );
};

export default ShippingForm;
