"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { 
    MdArrowBack, 
    MdExpandMore, 
    MdStore, 
    MdPerson, 
    MdPhone, 
    MdLocationOn, 
    MdHome, 
    MdNoteAlt, 
    MdCheckCircle, 
    MdErrorOutline 
} from 'react-icons/md';
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

interface ShippingFormProps {
    formData: ShippingFormData;
    errors?: ShippingFormErrors;
    touched?: Record<string, boolean>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleBlur?: (field: keyof ShippingFormData) => void;
}

const ShippingForm = ({
    formData,
    errors = {},
    touched = {},
    handleInputChange,
    handleBlur,
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
            <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs">
                <div className="flex items-center gap-2 pb-4 mb-5 border-b border-gray-100 dark:border-white/5">
                    <MdStore className="text-xl text-[#8A6305]" />
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
                                <MdStore className="text-base" />
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
                                className={`w-full bg-gray-50 dark:bg-zinc-800/60 border rounded-xl ps-10 pe-4 py-3 text-sm text-[#0B192C] dark:text-white outline-none transition-all placeholder:text-gray-400 font-medium ${
                                    touched.shopName && errors.shopName
                                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20 dark:bg-red-950/10'
                                        : 'border-gray-200 dark:border-white/10 focus:border-[#8A6305] focus:ring-1 focus:ring-[#8A6305]'
                                }`}
                                placeholder={t('checkout.shopNamePlaceholder')}
                                type="text"
                            />
                        </div>
                        {touched.shopName && errors.shopName && (
                            <p id="error-shopName" className="flex items-center gap-1 text-xs text-red-500 font-bold mt-1.5">
                                <MdErrorOutline className="text-sm shrink-0" />
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
                                <MdPerson className="text-base" />
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
                                className={`w-full bg-gray-50 dark:bg-zinc-800/60 border rounded-xl ps-10 pe-4 py-3 text-sm text-[#0B192C] dark:text-white outline-none transition-all placeholder:text-gray-400 font-medium ${
                                    touched.ownerName && errors.ownerName
                                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20 dark:bg-red-950/10'
                                        : 'border-gray-200 dark:border-white/10 focus:border-[#8A6305] focus:ring-1 focus:ring-[#8A6305]'
                                }`}
                                placeholder={t('checkout.ownerNamePlaceholder')}
                                type="text"
                            />
                        </div>
                        {touched.ownerName && errors.ownerName && (
                            <p id="error-ownerName" className="flex items-center gap-1 text-xs text-red-500 font-bold mt-1.5">
                                <MdErrorOutline className="text-sm shrink-0" />
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
                                <MdPhone className="text-base" />
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
                                className={`w-full bg-gray-50 dark:bg-zinc-800/60 border rounded-xl ps-10 pe-10 py-3 text-sm text-[#0B192C] dark:text-white outline-none transition-all placeholder:text-gray-400 font-mono font-medium ${
                                    showPhoneError
                                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20 dark:bg-red-950/10'
                                        : showPhoneSuccess
                                        ? 'border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                                        : 'border-gray-200 dark:border-white/10 focus:border-[#8A6305] focus:ring-1 focus:ring-[#8A6305]'
                                }`}
                                placeholder="09xxxxxxxx"
                                type="tel"
                                dir="ltr"
                            />
                            {showPhoneSuccess && (
                                <div className="absolute inset-y-0 end-0 pe-3.5 flex items-center pointer-events-none text-emerald-500">
                                    <MdCheckCircle className="text-lg" />
                                </div>
                            )}
                        </div>
                        {showPhoneError ? (
                            <p id="phone-hint" className="flex items-center gap-1 text-xs text-red-500 font-bold mt-1.5">
                                <MdErrorOutline className="text-sm shrink-0" />
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
                                <MdLocationOn className="text-base" />
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
                                className={`w-full bg-gray-50 dark:bg-zinc-800/60 border rounded-xl ps-10 pe-10 py-3 text-sm text-[#0B192C] dark:text-white outline-none transition-all appearance-none cursor-pointer font-medium ${
                                    touched.city && errors.city
                                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20 dark:bg-red-950/10'
                                        : 'border-gray-200 dark:border-white/10 focus:border-[#8A6305] focus:ring-1 focus:ring-[#8A6305]'
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
                                <MdExpandMore className="text-xl" />
                            </div>
                        </div>
                        {touched.city && errors.city && (
                            <p id="error-city" className="flex items-center gap-1 text-xs text-red-500 font-bold mt-1.5">
                                <MdErrorOutline className="text-sm shrink-0" />
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
                                <MdHome className="text-base" />
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
                                className={`w-full bg-gray-50 dark:bg-zinc-800/60 border rounded-xl ps-10 pe-4 py-3 text-sm text-[#0B192C] dark:text-white outline-none transition-all placeholder:text-gray-400 font-medium ${
                                    touched.streetAddress && errors.streetAddress
                                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20 dark:bg-red-950/10'
                                        : 'border-gray-200 dark:border-white/10 focus:border-[#8A6305] focus:ring-1 focus:ring-[#8A6305]'
                                }`}
                                placeholder={isAr ? 'مثال: حي الإنشاءات، شارع الجمهورية، بجانب صيدلية الأمل' : 'e.g. Inshaat District, Al-Jumhouriya Street, near Al-Amal Pharmacy'}
                                type="text"
                            />
                        </div>
                        {touched.streetAddress && errors.streetAddress && (
                            <p id="error-streetAddress" className="flex items-center gap-1 text-xs text-red-500 font-bold mt-1.5">
                                <MdErrorOutline className="text-sm shrink-0" />
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
                                <MdNoteAlt className="text-base" />
                            </div>
                            <textarea
                                id="field-notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                onBlur={() => onFieldBlur('notes')}
                                maxLength={500}
                                rows={3}
                                className="w-full bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-white/10 rounded-xl ps-10 pe-4 py-3 text-sm text-[#0B192C] dark:text-white focus:border-[#8A6305] focus:ring-1 focus:ring-[#8A6305] outline-none transition-all placeholder:text-gray-400 resize-none font-medium"
                                placeholder={t('checkout.notesPlaceholder')}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mt-2 px-1">
                <Link className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#475569] hover:text-[#0B192C] dark:hover:text-[#8A6305] transition-colors" href="/cart">
                    <MdArrowBack className={`text-sm ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                    {t('common.returnToCart')}
                </Link>
            </div>
        </div>
    );
};

export default ShippingForm;
