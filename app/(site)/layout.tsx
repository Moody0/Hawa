import Header from "../components/Header";
import Footer from "../components/Footer";
import FooterInfoBar from "../components/FooterInfoBar";
import AnnouncementBar from "../components/AnnouncementBar";
import { getI18n } from "@/lib/i18n";
import { getCatalogCategories } from "@/lib/catalog";
import { getNavigationData } from "@/lib/navigation";

import React, { Suspense } from "react";
import NavigationProgressBar from "../components/NavigationProgressBar";

async function getCategories() {
    try {
        return await getCatalogCategories();
    } catch (error) {
        console.error("Failed to fetch categories for header:", error);
        return [];
    }
}

export default async function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [categories, navData, { t, dir, language }] = await Promise.all([
        getCategories(),
        getNavigationData(),
        getI18n(),
    ]);

    return (
        <div className="min-h-screen flex flex-col" dir={dir}>
            {/* Instant Navigation Progress Bar */}
            <Suspense fallback={null}>
                <NavigationProgressBar />
            </Suspense>

            {/* Header with Server-Side Pre-rendered Navigation Data */}
            <Header
                initialCategories={categories}
                initialNavData={navData}
                dir={dir}
                language={language}
            />

            {/* Main Content */}
            <main id="main-content" className="flex-1" tabIndex={-1}>
                {children}
            </main>

            {/* Footer */}
            <Footer t={t} language={language} />
        </div>
    );
}
