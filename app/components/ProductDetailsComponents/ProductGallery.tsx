"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { FreeMode, Thumbs, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/thumbs';
import ResilientImage from '../ResilientImage';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

interface ProductGalleryProps {
    images: any;
    isTrending?: boolean;
}

const ProductGallery = ({ images, isTrending }: ProductGalleryProps) => {
    const { language } = useLanguage();
    const isArabic = language === 'ar';

    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);

    const dialogRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const lastActiveElementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        setMounted(true);
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduceMotion(motionQuery.matches);
        const handleMotionChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
        motionQuery.addEventListener('change', handleMotionChange);
        return () => motionQuery.removeEventListener('change', handleMotionChange);
    }, []);

    const openLightbox = (img: string, triggerEl?: HTMLElement | null) => {
        lastActiveElementRef.current = triggerEl || (document.activeElement as HTMLElement | null);
        setSelectedImage(img);
    };

    const closeLightbox = () => {
        setSelectedImage(null);
    };

    useEffect(() => {
        if (!selectedImage) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        // Make background elements inert while lightbox is open
        const portalEl = document.getElementById('product-lightbox-portal');
        const siblingsToInert: HTMLElement[] = [];
        Array.from(document.body.children).forEach((child) => {
            if (child !== portalEl && child instanceof HTMLElement && !child.hasAttribute('inert')) {
                child.setAttribute('inert', '');
                siblingsToInert.push(child);
            }
        });

        // Set focus to the close button initially
        const focusTimer = setTimeout(() => {
            closeButtonRef.current?.focus();
        }, 50);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                closeLightbox();
                return;
            }

            if (event.key === 'Tab' && dialogRef.current) {
                const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements.length === 0) return;

                const firstEl = focusableElements[0];
                const lastEl = focusableElements[focusableElements.length - 1];

                if (event.shiftKey) {
                    if (document.activeElement === firstEl) {
                        event.preventDefault();
                        lastEl.focus();
                    }
                } else {
                    if (document.activeElement === lastEl) {
                        event.preventDefault();
                        firstEl.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            clearTimeout(focusTimer);
            document.body.style.overflow = previousOverflow;
            siblingsToInert.forEach((el) => {
                el.removeAttribute('inert');
            });
            document.removeEventListener('keydown', handleKeyDown);
            // Return focus to the trigger element
            if (lastActiveElementRef.current && typeof lastActiveElementRef.current.focus === 'function') {
                lastActiveElementRef.current.focus();
            }
        };
    }, [selectedImage]);

    const allImages = typeof images === 'string'
        ? images.split(',').map(img => img.trim()).filter(Boolean)
        : Array.isArray(images) ? images : [];

    const lightbox = (
        <div id="product-lightbox-portal">
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label={isArabic ? 'معاينة صورة المنتج المكبرة' : 'Expanded product image preview'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
                        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-8"
                        onClick={closeLightbox}
                    >
                        <button
                            ref={closeButtonRef}
                            type="button"
                            aria-label={isArabic ? 'إغلاق الصورة المكبرة' : 'Close expanded product image'}
                            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-[100000] p-2.5 bg-black/40 hover:bg-black/60 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A6305]"
                            onClick={closeLightbox}
                        >
                            <X size={28} />
                        </button>

                        <motion.div
                            initial={reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={reduceMotion ? { scale: 1, opacity: 0 } : { scale: 0.95, opacity: 0 }}
                            transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
                            className="relative max-w-6xl w-full h-full flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedImage}
                                alt={isArabic ? 'صورة المنتج بحجم كبير' : 'Expanded product view'}
                                className="max-w-full max-h-full object-contain rounded-[10px] border border-white/10 select-none"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <div className="flex flex-col gap-3 self-start h-fit w-full">
            {/* Main Image Slider */}
            <div className="relative w-full aspect-square lg:aspect-[6/5] max-w-[882px] mx-auto overflow-hidden rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 shadow-[0_18px_50px_-42px_rgba(11,25,44,0.45)]">
                <Swiper
                    spaceBetween={10}
                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                    modules={[FreeMode, Thumbs, Autoplay]}
                    onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                    autoplay={
                        reduceMotion
                            ? false
                            : (allImages.length > 1
                                ? {
                                    delay: 3500,
                                    disableOnInteraction: false,
                                    pauseOnMouseEnter: true,
                                }
                                : false)
                    }
                    loop={allImages.length > 1}
                    className="h-full w-full bg-white dark:bg-zinc-900"
                >
                    {allImages.map((img, index) => (
                        <SwiperSlide
                            key={`main-${index}`}
                            className="bg-white dark:bg-zinc-900"
                        >
                            <button
                                type="button"
                                onClick={(e) => openLightbox(img, e.currentTarget)}
                                aria-label={isArabic ? `تكبير صورة المنتج ${index + 1}` : `Expand product image ${index + 1}`}
                                className="relative w-full h-full flex items-center justify-center bg-white dark:bg-zinc-900 p-5 sm:p-8 lg:p-10 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8A6305]"
                            >
                                <ResilientImage
                                    src={img}
                                    alt={`Product image ${index + 1}`}
                                    className="w-full h-full object-contain transition-opacity duration-500"
                                    priority={index === 0}
                                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 88vw, 48vw"
                                />
                            </button>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Trending Badge */}
                {isTrending && (
                    <div className="absolute top-3 right-3 z-20 pointer-events-none">
                        <span className="inline-block bg-[#0B192C] text-[#E5B54A] border border-[#8A6305]/40 px-2.5 py-1 rounded-[6px] text-[10px] font-bold tracking-wider uppercase leading-tight">
                            Trending
                        </span>
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
                <div className="w-full max-w-[882px] mx-auto">
                    <Swiper
                        onSwiper={setThumbsSwiper}
                        spaceBetween={10}
                        slidesPerView={4}
                        freeMode={true}
                        watchSlidesProgress={true}
                        modules={[FreeMode, Thumbs]}
                        className="thumbs-swiper"
                        breakpoints={{
                            640: { slidesPerView: 5 },
                            768: { slidesPerView: 6 },
                        }}
                    >
                        {allImages.map((img, index) => (
                            <SwiperSlide key={`thumb-${index}`}>
                                <div className={`relative aspect-square cursor-pointer rounded-[10px] overflow-hidden border-2 transition-colors duration-150 bg-white dark:bg-zinc-900 ${activeIndex === index ? 'border-[#8A6305]' : 'border-slate-200 dark:border-white/10 hover:border-[#8A6305]/50'
                                    }`}>
                                    <ResilientImage
                                        src={img}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-contain p-1"
                                        loading="lazy"
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            )}

            {/* Render Lightbox via Portal */}
            {mounted && createPortal(lightbox, document.body)}

            <style jsx global>{`
                .thumbs-swiper {
                    padding: 4px 0;
                }
                .thumbs-swiper .swiper-slide {
                    width: 20%;
                    height: auto;
                }
                .thumbs-swiper .swiper-slide-thumb-active .relative {
                    border-color: #8A6305 !important;
                }
                .dark .thumbs-swiper .swiper-slide-thumb-active .relative {
                    border-color: #8A6305 !important;
                }
            `}</style>
        </div>
    );
};

export default ProductGallery;
