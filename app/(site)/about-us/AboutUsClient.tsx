'use client';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import ResilientImage from '@/app/components/ResilientImage';
import { getWebsiteContent } from '@/lib/website-content';

export default function AboutUsClient({ settings }: { settings: Record<string, any> | null }) {
    const { language, dir } = useLanguage();
    const ar = language === 'ar' || dir === 'rtl';
    const content = getWebsiteContent(settings?.websiteContent);
    const copy = (key: string) => String(settings?.[ar ? `${key}Ar` : key] ?? settings?.[key] ?? '');
    const localized = (key: keyof typeof content) => String(content[(ar ? `${key}Ar` : key) as keyof typeof content] ?? content[key]);
    const values = [1, 2, 3].map(n => ({ title: copy(`aboutValue${n}Title`), description: copy(`aboutValue${n}Desc`) })).filter(v => v.title || v.description);
    return <div className="container-custom py-10 sm:py-16 space-y-12 sm:space-y-20 text-slate-900 dark:text-white">
        <header className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-5 max-w-xl">
                <p className="text-sm font-semibold text-primary dark:text-primary-dark">{copy('footerBrandTitle')}</p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">{copy('aboutHeroTitle') || (ar ? 'من نحن' : 'About us')}</h1>
                {copy('aboutHeroSubtitle') && <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">{copy('aboutHeroSubtitle')}</p>}
            </div>
            {settings?.aboutHeroImage && <div className="relative aspect-[4/3] rounded-xl overflow-hidden"><ResilientImage src={settings.aboutHeroImage} alt={copy('aboutHeroTitle')} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority /></div>}
        </header>
        {content.aboutStoryEnabled && <section className="grid gap-8 lg:grid-cols-2 lg:items-center border-t border-slate-200 dark:border-white/10 pt-10">
            {settings?.aboutNarrativeImage && <div className="relative aspect-[4/3] rounded-xl overflow-hidden"><ResilientImage src={settings.aboutNarrativeImage} alt={copy('aboutNarrativeTitle')} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div>}
            <div className="space-y-4">
                {copy('aboutNarrativeFounded') && <p className="text-sm font-semibold text-primary dark:text-primary-dark">{copy('aboutNarrativeFounded')}</p>}
                {copy('aboutNarrativeTitle') && <h2 className="text-2xl sm:text-3xl font-bold">{copy('aboutNarrativeTitle')}</h2>}
                {['aboutNarrativeDesc1', 'aboutNarrativeDesc2'].map(key => copy(key) && <p key={key} className="text-slate-600 dark:text-slate-300 leading-8 whitespace-pre-line">{copy(key)}</p>)}
                {copy('aboutNarrativeQuote') && <blockquote className="border-s-2 border-primary ps-4 font-semibold leading-relaxed">{copy('aboutNarrativeQuote')}</blockquote>}
            </div>
        </section>}
        {content.aboutValuesEnabled && values.length > 0 && <section className="border-t border-slate-200 dark:border-white/10 pt-10">
            {copy('aboutValuesTitle') && <h2 className="text-2xl sm:text-3xl font-bold mb-3">{copy('aboutValuesTitle')}</h2>}
            {copy('aboutValuesDesc') && <p className="text-slate-600 dark:text-slate-300 mb-8">{copy('aboutValuesDesc')}</p>}
            <div className="grid gap-6 md:grid-cols-3">{values.map((value, i) => <article key={i} className="border-s-2 border-slate-200 dark:border-slate-700 ps-5"><h3 className="font-bold text-lg mb-3">{value.title}</h3><p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{value.description}</p></article>)}</div>
        </section>}
        {content.aboutContactEnabled && <section className="flex flex-col sm:flex-row gap-6 items-start sm:items-center sm:justify-between rounded-xl bg-slate-100 p-6 sm:p-8 dark:bg-slate-800"><div><h2 className="text-xl sm:text-2xl font-bold mb-2">{localized('aboutContactTitle')}</h2><p className="text-slate-600 dark:text-slate-300">{localized('aboutContactDescription')}</p></div><Link href="/contact" className="rounded-lg px-6 py-3 bg-[#0B192C] hover:bg-[#16304d] text-white font-semibold shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4">{localized('aboutContactButton')}</Link></section>}
    </div>;
}
