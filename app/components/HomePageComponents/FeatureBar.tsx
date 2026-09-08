import React from 'react';
import { Headset, RotateCw, UserCheck, Truck } from 'lucide-react';
import { getI18n } from '@/lib/i18n';

const FeatureBar = async () => {
    const { t } = await getI18n();

    const features = [
        {
            icon: Headset,
            title: t('home.customerSupport'),
            subtitle: t('home.customerSupport247'),
        },
        {
            icon: RotateCw,
            title: t('home.easyReturns'),
            subtitle: t('home.easyReturnsDesc'),
        },
        {
            icon: UserCheck,
            title: t('home.authenticProducts'),
            subtitle: t('home.authenticProductsDesc'),
        },
        {
            icon: Truck,
            title: t('home.fastShipping'),
            subtitle: t('home.fastShippingDesc'),
        },
    ];

    return (
        <section className="w-full bg-white dark:bg-surface-dark py-6 md:py-10 border-b border-gray-50 dark:border-white/5">
            <div className="container-custom">
                <div className="grid grid-cols-4 lg:grid-cols-4 gap-2 md:gap-10">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="flex flex-col md:flex-row items-center gap-2 md:gap-4 justify-center md:justify-start text-center md:text-right"
                        >
                            <div className="flex-shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center">
                                <feature.icon className="text-text-main-light dark:text-white text-xl md:text-3xl" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] sm:text-xs md:text-base font-bold text-text-main-light dark:text-text-main-dark leading-tight">
                                    {feature.title}
                                </span>
                                <span className="hidden md:block text-xs md:text-sm text-text-muted-light dark:text-text-muted-dark">
                                    {feature.subtitle}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeatureBar;
