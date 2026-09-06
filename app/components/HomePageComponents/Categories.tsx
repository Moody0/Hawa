import Link from 'next/link'
import React from 'react'
import { MdChevronRight } from 'react-icons/md';
import Image from 'next/image';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
}

interface CategoriesProps {
    categories: Category[];
    t: (key: string) => string;
    dir: 'ltr' | 'rtl';
}

const Categories = ({ categories, t, dir }: CategoriesProps) => {
    const defaultImage = 'https://images.unsplash.com/photo-1621996346565-e3d5d6281290?w=800';

    if (!categories || categories.length === 0) {
        return null;
    }

    return (
        <section className="container-custom py-6 md:py-8">
            <div className="w-full">
                <div className="flex items-center justify-between mb-8 px-2">
                    <h3 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">{t('home.categories')}</h3>
                    <Link className="text-primary font-medium text-sm flex items-center gap-1 " href="/categories">
                        {t('common.viewAll')} <MdChevronRight className={`text-sm ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                    </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-2 md:gap-4">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/categories/${category.slug}`}
                            className="group flex flex-col gap-3 p-2 rounded-2xl transition-all duration-300 hover:bg-white dark:hover:bg-white/5 premium-shadow-hover"
                        >
                            <div className="relative aspect-4/4 w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-white/5">
                                <Image
                                    src={category.image || defaultImage}
                                    alt={category.name}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <div className="flex flex-col items-center text-center px-1">
                                <h4 className="text-sm font-bold text-text-main-light dark:text-text-main-dark transition-colors">
                                    <span className="group-hover-underline-animated">{category.name}</span>
                                </h4>
                                <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark line-clamp-1">
                                    {category.description || t('home.bestSeller')}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Categories

