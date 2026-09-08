'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import { Home, ShoppingCart, LayoutGrid, Heart, User } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';

const BottomNav = () => {
    const { t, language } = useLanguage();
    const pathname = usePathname();
    const { totalItems } = useCart();

    const navItems = [
        {
            href: '/',
            label: t('common.home'),
            icon: Home,
            isActive: pathname === '/',
        },
        {
            href: '/cart',
            label: t('common.cart'),
            icon: ShoppingCart,
            isActive: pathname === '/cart',
            badge: totalItems > 0 ? totalItems : null,
        },
        {
            href: '/categories',
            label: t('nav.categories'),
            icon: LayoutGrid,
            isActive: pathname === '/categories' || pathname.startsWith('/categories/'),
            isCenter: true,
        },
        {
            href: '/products?favorites=true',
            label: t('nav.favorites'),
            icon: Heart,
            isActive: false,
        },
        {
            href: '/account',
            label: language === 'ar' ? 'حسابي' : 'Account',
            icon: User,
            isActive: pathname.startsWith('/account'),
        },
    ];

    return (
        <nav 
            aria-label={language === 'ar' ? 'التنقل السفلي للجوال' : 'Mobile bottom navigation'}
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-white/10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
        >
            <div className="flex items-end justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isCenter = item.isCenter;

                    if (isCenter) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-label={item.label}
                                className="flex flex-col items-center -mt-5"
                            >
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                                    item.isActive
                                        ? 'bg-primary text-white'
                                        : 'bg-primary text-white'
                                }`}>
                                    <Icon className="text-2xl" />
                                </div>
                                <span className={`text-[10px] mt-1 font-medium ${
                                    item.isActive ? 'text-primary' : 'text-text-muted-light dark:text-text-muted-dark'
                                }`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-label={item.label}
                            className="flex flex-col items-center gap-0.5 py-1 relative"
                        >
                            <div className="relative">
                                <Icon className={`text-2xl transition-colors ${
                                    item.isActive ? 'text-primary' : 'text-text-muted-light dark:text-text-muted-dark'
                                }`} />
                                {item.badge && (
                                    <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[10px] font-medium ${
                                item.isActive ? 'text-primary' : 'text-text-muted-light dark:text-text-muted-dark'
                            }`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
