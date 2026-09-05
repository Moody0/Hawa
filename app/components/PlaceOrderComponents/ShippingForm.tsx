"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { MdInfo, MdArrowBack, MdExpandMore } from 'react-icons/md';

interface ShippingFormProps {
    formData: {
        shopName: string;
        ownerName: string;
        phone: string;
        streetAddress: string;
        city: string;
        notes: string;
    };
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const ShippingForm = ({ formData, handleInputChange }: ShippingFormProps) => {
    const { t, dir } = useLanguage();
    const [phoneTouched, setPhoneTouched] = useState(false);

    const isPhoneInvalid = phoneTouched && formData.phone.length > 0 && !/^09\d{8}$/.test(formData.phone);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9+]/g, '');
        if (val.startsWith('+963')) val = '0' + val.slice(4);
        else if (val.startsWith('00963')) val = '0' + val.slice(5);
        else if (val.startsWith('963')) val = '0' + val.slice(3);
        val = val.replace(/[^0-9]/g, '').slice(0, 10);
        const syntheticEvent = {
            ...e,
            target: { ...e.target, name: 'phone', value: val },
        } as React.ChangeEvent<HTMLInputElement>;
        handleInputChange(syntheticEvent);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Store / Shop Name */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold mb-2 text-[#0B192C] dark:text-white uppercase tracking-wider">
                            {t('checkout.shopName')} *
                        </label>
                        <input
                            name="shopName"
                            value={formData.shopName}
                            onChange={handleInputChange}
                            required
                            autoComplete="organization"
                            className="w-full bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-[#0B192C] dark:text-white focus:border-[#8A6305] focus:ring-1 focus:ring-[#8A6305] outline-none transition-all placeholder:text-gray-400 font-medium"
                            placeholder={t('checkout.shopNamePlaceholder')}
                            type="text"
                        />
                    </div>

                    {/* Owner / Contact Person */}
                    <div className="col-span-1">
                        <label className="block text-xs font-bold mb-2 text-[#0B192C] dark:text-white uppercase tracking-wider">
                            {t('checkout.ownerName')} *
                        </label>
                        <input
                            name="ownerName"
                            value={formData.ownerName}
                            onChange={handleInputChange}
                            required
                            autoComplete="name"
                            className="w-full bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-[#0B192C] dark:text-white focus:border-[#8A6305] focus:ring-1 focus:ring-[#8A6305] outline-none transition-all placeholder:text-gray-400"
                            placeholder={t('checkout.ownerNamePlaceholder')}
                            type="text"
                        />
                    </div>

                    {/* WhatsApp Mobile Number */}
                    <div className="col-span-1">
                        <label className="block text-xs font-bold mb-2 text-[#0B192C] dark:text-white uppercase tracking-wider">
                            {t('checkout.phoneNumber')} *
                        </label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            onBlur={() => setPhoneTouched(true)}
                            required
                            autoComplete="tel"
                            inputMode="numeric"
                            maxLength={10}
                            className={`w-full bg-gray-50 dark:bg-zinc-800/60 border rounded-xl px-4 py-3 text-sm text-[#0B192C] dark:text-white outline-none transition-all placeholder:text-gray-400 font-medium ${
                                isPhoneInvalid
                                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                    : 'border-gray-200 dark:border-white/10 focus:border-[#8A6305] focus:ring-1 focus:ring-[#8A6305]'
                            }`}
                            placeholder="09xxxxxxxx"
                            type="tel"
                            dir="ltr"
                        />
                        <p className={`text-xs font-medium mt-1.5 ${
                            isPhoneInvalid
                                ? 'text-red-500 font-bold'
                                : 'text-gray-400'
                        }`}>
                            {dir === 'rtl' ? 'يجب أن يبدأ بـ 09 ويتكون من 10 أرقام (لتلقي تفاصيل الطلب عبر واتساب)' : 'Must start with 09 and be 10 digits'}
                        </p>
                    </div>

                    {/* City / Governorate */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold mb-2 text-[#0B192C] dark:text-white uppercase tracking-wider">
                            {t('checkout.city')} *
                        </label>
                        <div className="relative">
                            <select
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 pe-10 text-sm text-[#0B192C] dark:text-white focus:border-[#8A6305] focus:ring-1 focus:ring-[#8A6305] outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-white dark:bg-zinc-900">{dir === 'rtl' ? 'اختر المحافظة / المنطقة' : 'Select City / Governorate'}</option>
                                <option value="Damascus" className="bg-white dark:bg-zinc-900">{dir === 'rtl' ? 'دمشق' : 'Damascus'}</option>
                                <option value="Rif Dimashq" className="bg-white dark:bg-zinc-900">{dir === 'rtl' ? 'ريف دمشق' : 'Rif Dimashq'}</option>
                                <option value="Homs" className="bg-white dark:bg-zinc-900">{dir === 'rtl' ? 'حمص' : 'Homs'}</option>
                                <option value="Hama" className="bg-white dark:bg-zinc-900">{dir === 'rtl' ? 'حماة' : 'Hama'}</option>
                                <option value="Aleppo" className="bg-white dark:bg-zinc-900">{dir === 'rtl' ? 'حلب' : 'Aleppo'}</option>
                                <option value="Latakia" className="bg-white dark:bg-zinc-900">{dir === 'rtl' ? 'اللاذقية' : 'Latakia'}</option>
                                <option value="Tartus" className="bg-white dark:bg-zinc-900">{dir === 'rtl' ? 'طرطوس' : 'Tartus'}</option>
                                <option value="Daraa" className="bg-white dark:bg-zinc-900">{dir === 'rtl' ? 'درعا' : 'Daraa'}</option>
                                <option value="As-Suwayda" className="bg-white dark:bg-zinc-900">{dir === 'rtl' ? 'السويداء' : 'As-Suwayda'}</option>
                                <option value="Quneitra" className="bg-white dark:bg-zinc-900">{dir === 'rtl' ? 'القنيطرة' : 'Quneitra'}</option>
                                <option value="Deir ez-Zor" className="bg-white dark:bg-zinc-900">{dir === 'rtl' ? 'دير الزور' : 'Deir ez-Zor'}</option>
                                <option value="Al-Hasakah" className="bg-white dark:bg-zinc-900">{dir === 'rtl' ? 'الحسكة' : 'Al-Hasakah'}</option>
                                <option value="Raqqa" className="bg-white dark:bg-zinc-900">{dir === 'rtl' ? 'الرقة' : 'Raqqa'}</option>
                                <option value="Idlib" className="bg-white dark:bg-zinc-900">{dir === 'rtl' ? 'إدلب' : 'Idlib'}</option>
                            </select>
                            <div className="absolute inset-y-0 end-3 flex items-center pointer-events-none text-[#475569]">
                                <MdExpandMore className="text-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Street Address */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold mb-2 text-[#0B192C] dark:text-white uppercase tracking-wider">
                            {t('checkout.streetAddress')} *
                        </label>
                        <input
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleInputChange}
                            autoComplete="street-address"
                            required
                            className="w-full bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-[#0B192C] dark:text-white focus:border-[#8A6305] focus:ring-1 focus:ring-[#8A6305] outline-none transition-all placeholder:text-gray-400"
                            placeholder={dir === 'rtl' ? 'مثال: حي الإنشاءات، شارع الجمهورية، بجانب صيدلية الأمل' : 'e.g. Inshaat District, Al-Jumhouriya Street'}
                            type="text"
                        />
                    </div>

                    {/* Delivery Notes */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold mb-2 text-[#0B192C] dark:text-white uppercase tracking-wider">
                            {t('checkout.notes')}
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-[#0B192C] dark:text-white focus:border-[#8A6305] focus:ring-1 focus:ring-[#8A6305] outline-none transition-all placeholder:text-gray-400 resize-none"
                            placeholder={t('checkout.notesPlaceholder')}
                        />
                    </div>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-zinc-800/60 rounded-xl border border-gray-200 dark:border-white/10">
                        <MdInfo className="text-[#8A6305] text-lg shrink-0" />
                        <p className="text-xs font-medium text-[#475569] dark:text-gray-300">{t('checkout.deliveryInfo')}</p>
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
