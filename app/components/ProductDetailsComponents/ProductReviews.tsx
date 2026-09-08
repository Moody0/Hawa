"use client";

import React, { useState, useEffect } from 'react';
import { Star, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import ReviewModal from './ReviewModal';
import ResilientImage from '@/app/components/ResilientImage';

interface Review {
    id: string;
    rating: number;
    feedback: string | null;
    image: string | null;
    name: string;
    createdAt: string;
}

interface ProductReviewsProps {
    productId: string;
    productName: string;
    productImage: string;
}

export default function ProductReviews({ productId, productName, productImage }: ProductReviewsProps) {
    const { t, language } = useLanguage();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialRating, setInitialRating] = useState(5);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [visibleCount, setVisibleCount] = useState(3);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(`/api/reviews?productId=${productId}`);
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, [productId]);

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) ratingCounts[r.rating as keyof typeof ratingCounts]++;
    });

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    const handleStarClick = (rating: number) => {
        setInitialRating(rating);
        setIsModalOpen(true);
    };

    const getInitials = (name: string) => {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="mt-16 mb-4 w-full">
            {/* Section Title */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-[#0B192C] dark:text-white tracking-tight">
                    {t('products.reviews')}
                    {reviews.length > 0 && (
                        <span className="text-[#475569] font-normal text-base ms-2">({reviews.length})</span>
                    )}
                </h2>
                <button
                    onClick={() => handleStarClick(5)}
                    className="text-sm font-semibold text-[#0B192C] dark:text-white border border-[#0B192C] dark:border-white/20 rounded-[10px] px-5 py-2.5 hover:bg-[#0B192C] hover:text-white dark:hover:bg-white dark:hover:text-[#0B192C] transition-colors duration-200"
                >
                    {t('products.writeReview')}
                </button>
            </div>

            {/* Summary + Reviews */}
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

                {/* Left Column: Summary */}
                <div className="lg:w-[280px] shrink-0">
                    <div className="flex flex-col gap-5">
                        {/* Average */}
                        <div className="flex items-end gap-3">
                            <span className="text-5xl font-bold text-[#0B192C] dark:text-white leading-none tracking-tight">{averageRating}</span>
                            <div className="flex flex-col gap-0.5 pb-0.5">
                                <div className="flex items-center gap-px">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        star <= Math.round(Number(averageRating))
                                            ? <Star key={star} className="text-[#8A6305] text-base" />
                                            : <Star key={star} className="text-gray-300 dark:text-zinc-600 text-base" />
                                    ))}
                                </div>
                                <span className="text-xs text-[#475569] dark:text-gray-400">{t('products.basedOn')} {reviews.length} {t('products.reviews').toLowerCase()}</span>
                            </div>
                        </div>

                        {/* Distribution Bars */}
                        <div className="flex flex-col gap-2.5">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = ratingCounts[star as keyof typeof ratingCounts];
                                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                return (
                                    <div key={star} className="flex items-center gap-3">
                                        <span className="text-xs font-medium text-[#475569] dark:text-gray-400 w-3 text-center">{star}</span>
                                        <div className="flex-1 h-[6px] bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#8A6305] rounded-full transition-all duration-700 ease-out"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-[#475569] dark:text-gray-400 w-7 text-end tabular-nums">{count}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Tap to Rate */}
                        <div className="pt-3 border-t border-gray-100 dark:border-white/10">
                            <span className="text-xs text-[#475569] dark:text-gray-400 block mb-2">{t('products.tapToRate')}</span>
                            <div
                                className="flex items-center gap-1 cursor-pointer"
                                onMouseLeave={() => setHoveredRating(0)}
                            >
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => handleStarClick(star)}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        {star <= hoveredRating
                                            ? <Star className="text-2xl text-[#8A6305] transition-colors" />
                                            : <Star className="text-2xl text-gray-300 dark:text-zinc-600 transition-colors" />
                                        }
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Reviews List */}
                <div className="flex-1 min-w-0">
                    {isLoading ? (
                        <div className="flex justify-center py-16">
                            <div className="w-6 h-6 border-2 border-gray-200 border-t-[#0B192C] dark:border-t-[#8A6305] rounded-full animate-spin" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex items-center gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} className="text-2xl text-gray-200 dark:text-zinc-700" />
                                ))}
                            </div>
                            <p className="text-sm text-[#475569]">{t('products.noReviews')}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {reviews.slice(0, visibleCount).map((review, index) => (
                                <div
                                    key={review.id}
                                    className={`py-6 ${index !== Math.min(visibleCount, reviews.length) - 1 ? 'border-b border-gray-100 dark:border-white/10' : ''}`}
                                >
                                    {/* Review Header */}
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[#0B192C] dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                                <span className="text-[11px] font-semibold text-white leading-none">
                                                    {getInitials(review.name)}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-[#0B192C] dark:text-white">{review.name}</span>
                                                <span className="text-xs text-[#475569]">{formatDate(review.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-px shrink-0">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                star <= review.rating
                                                    ? <Star key={star} className="text-sm text-[#8A6305]" />
                                                    : <Star key={star} className="text-sm text-gray-300 dark:text-zinc-600" />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Review Body */}
                                    {review.feedback && (
                                        <p className="text-[13px] leading-relaxed text-[#475569] dark:text-gray-300 whitespace-pre-wrap">
                                            {review.feedback}
                                        </p>
                                    )}

                                    {/* Review Image */}
                                    {review.image && (
                                        <div className="mt-3 relative rounded-[10px] overflow-hidden w-24 h-24 bg-gray-50 dark:bg-zinc-800">
                                            <ResilientImage src={review.image} alt="" className="w-full h-full object-cover" sizes="96px" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Show More */}
                            {reviews.length > visibleCount && (
                                <button
                                    onClick={() => setVisibleCount(reviews.length)}
                                    className="flex items-center gap-1 text-sm font-semibold text-[#0B192C] dark:text-white pt-4 hover:text-[#8A6305] transition-colors"
                                >
                                    {language === 'ar' ? 'عرض كل التقييمات' : 'Show all reviews'}
                                    <ChevronDown className="text-lg" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                productId={productId}
                productName={productName}
                productImage={productImage}
                initialRating={initialRating}
            />
        </div>
    );
}
