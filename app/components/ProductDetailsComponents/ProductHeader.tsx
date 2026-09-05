"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

interface ProductHeaderProps {
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    brandName?: string;
    categoryName?: string;
    averageRating?: number;
    totalReviews?: number;
}

const ProductHeader = ({ name, nameAr, nameEn, brandName, categoryName, averageRating = 0, totalReviews = 0 }: ProductHeaderProps) => {
    const { language } = useLanguage();

    const displayName = language === 'ar'
        ? (nameAr || name)
        : (nameEn || name || nameAr);

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (averageRating >= i) {
                stars.push(<FaStar key={i} />);
            } else if (averageRating >= i - 0.5) {
                stars.push(<FaStarHalfAlt key={i} />);
            } else {
                stars.push(<FaRegStar key={i} />);
            }
        }
        return stars;
    };

    return (
        <div className="mb-3">
            {/* Title */}
            <h1 
                className={`text-[#0B192C] dark:text-white text-2xl sm:text-3xl font-extrabold leading-tight mb-3 tracking-tight ${language === 'ar' ? 'text-right' : 'text-left'}`}
            >
                {displayName}
            </h1>

            {/* Reviews Summary */}
            <div 
                className="flex items-center gap-2 mb-4 cursor-pointer group w-fit"
                onClick={() => {
                    document.getElementById('product-reviews')?.scrollIntoView({ behavior: 'smooth' });
                }}
            >
                <div className="flex text-[#8A6305] text-sm gap-0.5">
                    {renderStars()}
                </div>
                <span className="text-xs text-[#475569] font-medium group-hover:text-[#0B192C] dark:group-hover:text-white transition-colors">
                    {language === 'ar' ? `(${totalReviews} تقييم)` : `(${totalReviews} Reviews)`}
                </span>
            </div>

            {/* Brand and Category Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs font-semibold">
                {brandName && (
                    <div className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800/60 px-3 py-1.5 rounded-full text-[#0B192C] dark:text-gray-200 w-fit">
                        <span className="text-[#475569] font-normal">{language === 'ar' ? 'البراند:' : 'Brand:'}</span>
                        <span>{brandName}</span>
                    </div>
                )}
                {categoryName && (
                    <div className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800/60 px-3 py-1.5 rounded-full text-[#0B192C] dark:text-gray-200 w-fit">
                        <span className="text-[#475569] font-normal">{language === 'ar' ? 'القسم:' : 'Category:'}</span>
                        <span>{categoryName}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductHeader;
