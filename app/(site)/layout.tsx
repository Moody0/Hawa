import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import { getI18n } from "@/lib/i18n";

import React, { Suspense } from "react";
import NavigationProgressBar from "../components/NavigationProgressBar";
import ScrollManager from "../components/ScrollManager";

export default async function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { t, dir, language } = await getI18n();

    return (
        <div className="min-h-screen flex flex-col" dir={dir}>
            {/* Navigation Progress Bar & Scroll Management */}
            <Suspense fallback={null}>
                <NavigationProgressBar />
                <ScrollManager />
            </Suspense>

            {/* Header */}
            <Header
                dir={dir}
                language={language}
            />

            {/* Main Content */}
            <main id="main-content" className="flex-1" tabIndex={-1}>
                {children}
            </main>

            {/* Floating Scroll To Top Button */}
            <ScrollToTop />

            {/* Footer */}
            <Footer t={t} language={language} />
        </div>
    );
}
