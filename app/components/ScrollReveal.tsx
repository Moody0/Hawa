'use client';

import React, { useEffect, useRef } from 'react';

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    distance?: number;
    once?: boolean;
    margin?: string;
    variant?: 'section' | 'subtle';
    style?: React.CSSProperties;
}

const getTransform = (direction: string, distance: number) => {
    switch (direction) {
        case 'up':
            return `translate3d(0, ${distance}px, 0)`;
        case 'down':
            return `translate3d(0, -${distance}px, 0)`;
        case 'left':
            return `translate3d(${distance}px, 0, 0)`;
        case 'right':
            return `translate3d(-${distance}px, 0, 0)`;
        default:
            return 'none';
    }
};

export default function ScrollReveal({
    children,
    className = '',
    delay = 0,
    duration = 0.45,
    direction = 'up',
    distance = 12,
    once = true,
    margin = '80px 0px -20px 0px',
    variant = 'section',
    style,
}: ScrollRevealProps) {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        // WCAG 2.2 guideline 2.3.3: Respect prefers-reduced-motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
            return;
        }

        // If root is already in or above viewport on mount, do not animate backwards
        const rect = root.getBoundingClientRect();
        const isInOrAboveViewport = rect.top < window.innerHeight;
        if (isInOrAboveViewport) {
            return;
        }

        const animDistance = variant === 'subtle' ? Math.min(distance, 8) : Math.min(distance, 14);
        const initialTransform = getTransform(direction, animDistance);
        const animDurationMs = (variant === 'subtle' ? Math.min(duration, 0.35) : duration) * 1000;
        const delayMs = delay * 1000;

        let anim: Animation | null = null;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry && entry.isIntersecting) {
                    if (typeof root.animate === 'function') {
                        try {
                            anim = root.animate(
                                [
                                    { opacity: 0.35, transform: initialTransform },
                                    { opacity: 1, transform: 'translate3d(0, 0, 0)' },
                                ],
                                {
                                    duration: animDurationMs,
                                    delay: delayMs,
                                    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                                    fill: 'both',
                                }
                            );
                            anim.onfinish = () => {
                                root.style.opacity = '';
                                root.style.transform = '';
                            };
                        } catch {
                            root.style.opacity = '';
                            root.style.transform = '';
                        }
                    }

                    if (once) {
                        observer.disconnect();
                    }
                }
            },
            {
                root: null,
                rootMargin: margin,
                threshold: 0.02,
            }
        );

        observer.observe(root);

        return () => {
            observer.disconnect();
            if (anim) {
                try {
                    anim.cancel();
                } catch {
                    // ignore
                }
            }
            root.style.opacity = '';
            root.style.transform = '';
        };
    }, [delay, direction, distance, duration, margin, once, variant]);

    return (
        <div ref={rootRef} className={className} style={style}>
            {children}
        </div>
    );
}
