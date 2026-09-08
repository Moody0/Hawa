'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgressBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'idle' | 'loading' | 'completing'>('idle');
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const cleanup = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (safetyTimeoutRef.current) {
            clearTimeout(safetyTimeoutRef.current);
            safetyTimeoutRef.current = null;
        }
    }, []);

    const finish = useCallback(() => {
        cleanup();
        setProgress(100);
        setStatus('completing');
        safetyTimeoutRef.current = setTimeout(() => {
            setStatus('idle');
            setProgress(0);
        }, 300);
    }, [cleanup]);

    const start = useCallback(() => {
        cleanup();
        setStatus('loading');
        setProgress(30);

        intervalRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 85) return prev;
                return prev + Math.random() * 12;
            });
        }, 200);

        // Fail-safe: Force complete after 2.5 seconds max so it never gets stuck
        safetyTimeoutRef.current = setTimeout(() => {
            finish();
        }, 2500);
    }, [cleanup, finish]);

    // When pathname or searchParams change, finish the progress bar
    useEffect(() => {
        finish();
    }, [pathname, searchParams, finish]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            // Ignore non-left click or with modifier keys
            if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

            const target = (e.target as HTMLElement).closest('a');
            if (!target) return;

            const href = target.getAttribute('href');
            if (
                !href ||
                href.startsWith('#') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                href.startsWith('javascript:') ||
                target.target === '_blank' ||
                target.getAttribute('download') !== null
            ) {
                return;
            }

            try {
                const url = new URL(href, window.location.href);
                if (url.origin === window.location.origin) {
                    const currentUrl = new URL(window.location.href);
                    // Only start if actually navigating to a different URL
                    if (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search) {
                        start();
                    }
                }
            } catch {
                // Ignore invalid URLs
            }
        };

        const handlePopState = () => {
            start();
        };

        document.addEventListener('click', handleClick, { capture: true });
        window.addEventListener('popstate', handlePopState);

        return () => {
            document.removeEventListener('click', handleClick, { capture: true });
            window.removeEventListener('popstate', handlePopState);
            cleanup();
        };
    }, []);

    if (status === 'idle') return null;

    return (
        <div 
            className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] bg-transparent"
            aria-hidden="true"
        >
            <div
                className="h-full bg-gradient-to-r from-[#8A6305] via-[#E5B54A] to-[#8A6305] shadow-[0_0_8px_rgba(138,99,5,0.6)] ease-out"
                style={{
                    width: `${progress}%`,
                    opacity: status === 'completing' ? 0 : 1,
                    transition: status === 'completing' 
                        ? 'width 150ms ease-out, opacity 250ms ease-in 100ms' 
                        : 'width 250ms ease-out',
                }}
            />
        </div>
    );
}
