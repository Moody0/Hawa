"use client";

import React, { useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { MdAdd, MdRemove } from "react-icons/md";

const AccordionItem = ({ title, content, isOpen, onClick, isRTL }: { title: string, content: React.ReactNode, isOpen: boolean, onClick: () => void, isRTL: boolean }) => {
    return (
        <div className="border-b border-[#D5D5D5] dark:border-white/5">
            <button
                onClick={onClick}
                className="w-full flex items-center py-4 focus:outline-none group"
            >
                <span className={`text-[15px] text-[#0B192C] dark:text-white font-bold group-hover:text-[#8A6305] transition-colors ${isRTL ? 'ml-auto' : 'mr-auto'} order-2`}>
                    {title}
                </span>
                <span className="order-1">
                    {isOpen ? (
                        <MdRemove className="text-[25px] text-[#0B192C] dark:text-gray-300" />
                    ) : (
                        <MdAdd className="text-[22px] text-[#0B192C] dark:text-gray-300" />
                    )}
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="text-[15px] text-[#475569] dark:text-gray-400 leading-relaxed px-1">
                    {content}
                </div>
            </div>
        </div>
    );
};

interface ProductAccordionsProps {
    description?: string | null;
    descriptionAr?: string | null;
    descriptionEn?: string | null;
    options?: string | null;
}

const ProductAccordions = ({ description, descriptionAr, descriptionEn, options }: ProductAccordionsProps) => {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const [openIndex, setOpenIndex] = useState<number>(0);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    const activeDescription = isRTL
        ? (descriptionAr || description)
        : (descriptionEn || description || descriptionAr);

    return (
        <div className="flex flex-col w-full mt-1 md:border-t border-[#D5D5D5] dark:border-white/5">
            <AccordionItem
                title={isRTL ? 'تفاصيل ومواصفات المنتج' : 'Product Details & Specs'}
                content={<div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line leading-relaxed">{activeDescription || (isRTL ? 'منتج أصلي عالي الجودة من شركة هوا للتوزيع والتجارة' : 'Authentic high quality product from Hawa Distribution & Trading')}</div>}
                isOpen={openIndex === 0}
                onClick={() => toggleAccordion(0)}
                isRTL={isRTL}
            />
            {options && (
                <AccordionItem
                    title={isRTL ? 'الأحجام والخيارات المتوفرة' : 'Available Sizes & Options'}
                    content={<p className="font-semibold text-[#0B192C] dark:text-zinc-200">{options}</p>}
                    isOpen={openIndex === 1}
                    onClick={() => toggleAccordion(1)}
                    isRTL={isRTL}
                />
            )}
        </div>
    );
};

export default ProductAccordions;
