"use client";

import { useEffect, useState } from "react";
import { X, Search, Image } from 'lucide-react';
import { getRelatedProducts, getRelatedCategories, getRelatedBrands } from "../actions/related";
import { useLanguage } from "@/app/context/LanguageContext";

interface RelatedItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "products" | "categories" | "brands";
    entityType: "brandId" | "mainCategoryId" | "categoryId";
    entityId: string;
    entityName: string;
}

export default function RelatedItemsModal({
    isOpen,
    onClose,
    type,
    entityType,
    entityId,
    entityName
}: RelatedItemsModalProps) {
    const { t, dir } = useLanguage();
    const [searchQuery, setSearchQuery] = useState("");
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        
        const fetchItems = async () => {
            setLoading(true);
            try {
                if (type === "products") {
                    const res = await getRelatedProducts(entityType, entityId, searchQuery);
                    if (res.success && res.data) {
                        setItems(res.data);
                    }
                } else if (type === "categories" && entityType !== "categoryId") {
                    const res = await getRelatedCategories(entityType as any, entityId, searchQuery);
                    if (res.success && res.data) {
                        setItems(res.data);
                    }
                } else if (type === "brands") {
                    const res = await getRelatedBrands(entityId, searchQuery);
                    if (res.success && res.data) {
                        setItems(res.data);
                    }
                }
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        };

        const timer = setTimeout(() => {
            fetchItems();
        }, 300);

        return () => clearTimeout(timer);
    }, [isOpen, searchQuery, type, entityType, entityId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
            <div 
                className="w-full max-w-2xl bg-white dark:bg-surface-dark rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
                dir={dir}
            >
                <div className="flex items-center justify-between p-6 border-b border-black/[0.04] dark:border-white/[0.04]">
                    <div>
                        <h2 className="text-xl font-bold text-text-main dark:text-white">
                            {type === "products" ? t("admin.products") : type === "categories" ? t("admin.categories") : t("admin.brands")}
                        </h2>
                        <p className="text-sm text-text-sub dark:text-gray-400 mt-1">
                            {entityName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-text-sub hover:bg-black/5 hover:text-text-main dark:hover:bg-white/5 dark:hover:text-white transition-colors"
                    >
                        <X className="text-2xl" />
                    </button>
                </div>

                <div className="p-6 border-b border-black/[0.04] dark:border-white/[0.04]">
                    <div className="relative">
                        <Search className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-xl text-text-sub/60`} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={type === "products" ? t("admin.searchProducts") : type === "categories" ? t("admin.searchCategories") : t("admin.searchBrands") || "Search brands..."}
                            className={`w-full h-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-black/[0.04] dark:border-white/[0.04] ${dir === 'rtl' ? 'pr-11 pl-4' : 'pl-11 pr-4'} text-sm text-text-main dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all`}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-text-sub dark:text-gray-400">
                            <p>{t("admin.noResultsFound") || "No results found"}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl border border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-surface-dark hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                                        {item.images ? (
                                            <img src={item.images.split(',')[0]} alt={item.name} className="w-full h-full object-cover" />
                                        ) : item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Image className="text-2xl text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-text-main dark:text-white truncate">{item.name}</h4>
                                        {type === "products" && (
                                            <p className="text-xs text-text-sub dark:text-gray-400 mt-0.5">
                                                Stock: {item.stock}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
