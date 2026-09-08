"use client";

import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { ChevronDown } from 'lucide-react';

interface LoadMoreButtonProps {
    handleLoadMore: () => void;
    loading: boolean;
    hasMore: boolean;
}

const LoadMoreButton = ({ handleLoadMore, loading, hasMore }: LoadMoreButtonProps) => {
    const { t } = useLanguage();

    if (!hasMore) return null;

    return (
        <div className="mt-16 flex items-center justify-center">
            <button
                onClick={handleLoadMore}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-8 py-3 text-sm font-bold text-text-main-light hover:bg-primary hover:border-primary hover:text-white transition-colors dark:bg-white/5 dark:border-white/10 dark:text-white dark:hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
                {loading ? t('common.loading') : t('products.loadMore')}
                <ChevronDown className="text-lg" />
            </button>
        </div>
    );
};

export default LoadMoreButton;
