'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollManager() {
    const pathname = usePathname();
    const prevPathname = useRef(pathname);
    const isPopState = useRef(false);

    useEffect(() => {
        // Ensure browser automatic scroll restoration is enabled for Back/Forward navigation
        if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'auto';
        }

        const handlePopState = () => {
            isPopState.current = true;
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    useEffect(() => {
        // Only scroll to top on genuine new-page navigations (not popstate/back-forward)
        if (prevPathname.current !== pathname) {
            if (!isPopState.current) {
                // If there is no hash anchor, scroll to top for new page
                if (typeof window !== 'undefined' && !window.location.hash) {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                }
            }
            isPopState.current = false;
            prevPathname.current = pathname;
        }
    }, [pathname]);

    return null;
}
