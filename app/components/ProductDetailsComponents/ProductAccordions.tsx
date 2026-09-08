"use client";

import React, { useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { ChevronDown } from 'lucide-react';

const AccordionItem = ({ title, content, isOpen, onClick, panelId }: { title: string, content: React.ReactNode, isOpen: boolean, onClick: () => void, panelId: string }) => {
    return (
        <div className="border-b border-slate-200 dark:border-white/10">
            <button
                type="button"
                onClick={onClick}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full flex items-center justify-between py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A6305]/50 focus-visible:ring-offset-2 rounded-sm group cursor-pointer"
            >
                <span className="text-sm text-[#0B192C] dark:text-white font-bold group-hover:text-[#8A6305] transition-colors">
                    {title}
                </span>
                <span className={`w-6 h-6 flex items-center justify-center text-slate-500 group-hover:text-[#8A6305] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#8A6305]' : ''}`}>
                    <ChevronDown size={18} />
                </span>
            </button>
            <div
                id={panelId}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] pb-4 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed px-0.5">
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
        <div className="flex flex-col w-full mt-2 border-t border-slate-200 dark:border-white/10">
            <AccordionItem
                title={isRTL ? 'تفاصيل ومواصفات المنتج' : 'Product Details & Specs'}
                content={
                    <div className="whitespace-pre-line leading-relaxed text-slate-600 dark:text-gray-300">
                        {activeDescription || (isRTL ? 'منتج أصلي عالي الجودة متوفر للتوزيع التجاري لدى شركة حوا للتوزيع والتجارة.' : 'Authentic high quality product available for commercial distribution by Hawa Distribution & Trading.')}
                    </div>
                }
                isOpen={openIndex === 0}
                onClick={() => toggleAccordion(0)}
                panelId="product-description-panel"
            />
            {options && (
                <AccordionItem
                    title={isRTL ? 'الأحجام والخيارات المتوفرة' : 'Available Sizes & Options'}
                    content={<p className="font-semibold text-[#0B192C] dark:text-zinc-200">{options}</p>}
                    isOpen={openIndex === 1}
                    onClick={() => toggleAccordion(1)}
                    panelId="product-options-panel"
                />
            )}
        </div>
    );
};

export default ProductAccordions;
