import Link from 'next/link';
import { ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react';
import ResilientImage from '@/app/components/ResilientImage';

interface QuickCategory {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    href?: string;
}

interface CategoryQuickStripProps {
    categories: QuickCategory[];
    isArabic: boolean;
}

export default function CategoryQuickStrip({ categories, isArabic }: CategoryQuickStripProps) {
    const items = categories.filter((category) => category?.id && category.name && category.name.trim() !== 'عام').slice(0, 10);
    if (!items.length) return null;

    const MoreIcon = isArabic ? ChevronLeft : ChevronRight;

    return (
        <nav aria-label={isArabic ? 'الأقسام' : 'Categories'} className="container-custom pt-5">
            <div className="flex gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6 md:justify-center">
                {items.map((category) => {
                    const image = category.image?.trim();
                    return (
                        <Link
                            key={category.id}
                            href={category.href || `/products?category=${encodeURIComponent(category.slug)}`}
                            prefetch={false}
                            className="group flex w-[74px] shrink-0 flex-col items-center gap-2 sm:w-24"
                        >
                            <span className="relative flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_2px_10px_rgba(11,25,44,0.12)] ring-1 ring-slate-200/70 transition-transform group-active:scale-95 dark:bg-zinc-800 dark:ring-white/10 sm:h-20 sm:w-20">
                                {image && image !== '/placeholder.svg' ? (
                                    <ResilientImage src={image} alt="" fill sizes="80px" className="object-contain p-2" loading="lazy" />
                                ) : (
                                    <PackageOpen aria-hidden="true" className="size-7 text-slate-300" />
                                )}
                            </span>
                            <span className="line-clamp-1 text-center text-[11px] font-bold text-[#0B192C] dark:text-white sm:text-sm">{category.name}</span>
                        </Link>
                    );
                })}
                <Link href="/categories" prefetch={false} className="group flex w-[60px] shrink-0 flex-col items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center self-center rounded-full bg-white shadow-[0_2px_10px_rgba(11,25,44,0.12)] ring-1 ring-slate-200/70 dark:bg-zinc-800 dark:ring-white/10 mt-[15px] sm:mt-[20px]">
                        <MoreIcon className="h-4 w-4 text-[#8A6305] dark:text-[#E5B54A]" aria-hidden="true" />
                    </span>
                    <span className="text-center text-[11px] font-bold text-slate-500 dark:text-slate-300 sm:text-sm">{isArabic ? 'المزيد' : 'More'}</span>
                </Link>
            </div>
        </nav>
    );
}
