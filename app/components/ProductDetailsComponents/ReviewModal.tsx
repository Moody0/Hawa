"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MdClose, MdCloudUpload, MdStar, MdStarOutline } from 'react-icons/md';
import { useLanguage } from '@/app/context/LanguageContext';
import { toast } from 'react-hot-toast';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    productImage: string;
    initialRating: number;
}

export default function ReviewModal({ isOpen, onClose, productId, productName, productImage, initialRating }: ReviewModalProps) {
    const { t, language } = useLanguage();
    
    const [step, setStep] = useState(1);
    const [rating, setRating] = useState(initialRating || 5);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return null;
        
        const formData = new FormData();
        formData.append('file', imageFile);
        
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            
            const data = await res.json();
            if (data.url) {
                return data.url;
            }
            return null;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error(t('products.reviewModal.fillRequiredFields'));
            return;
        }

        setIsSubmitting(true);
        try {
            let uploadedImageUrl = null;
            if (imageFile) {
                uploadedImageUrl = await uploadImage();
            }

            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId,
                    rating,
                    feedback,
                    name,
                    email: email || undefined,
                    image: uploadedImageUrl,
                }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success(t('products.reviewModal.successMessage'));
                setTimeout(() => {
                    onClose();
                    setStep(1);
                    setFeedback('');
                    setName('');
                    setEmail('');
                    setImageFile(null);
                    setImagePreview(null);
                }, 1500);
            } else {
                toast.error(data.error || t('products.reviewModal.errorTitle'));
            }
        } catch (error) {
            console.error('Submit review error:', error);
            toast.error(t('products.reviewModal.errorTitle'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div 
                role="dialog"
                aria-modal="true"
                aria-label={language === 'ar' ? 'كتابة تقييم' : 'Write a review'}
                className="relative w-full sm:max-w-[420px] bg-white rounded-t-2xl sm:rounded-[10px] max-h-[90vh] overflow-y-auto"
            >

                {/* Header */}
                <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        {/* Step indicator */}
                        <div className="flex items-center gap-1.5">
                            <div className={`w-6 h-[3px] rounded-full transition-colors ${step >= 1 ? 'bg-gray-900' : 'bg-gray-200'}`} />
                            <div className={`w-6 h-[3px] rounded-full transition-colors ${step >= 2 ? 'bg-gray-900' : 'bg-gray-200'}`} />
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-[#475569] hover:text-[#0B192C] hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label={language === 'ar' ? 'إغلاق نافذة التقييم' : 'Close review modal'}
                    >
                        <MdClose className="text-lg" />
                    </button>
                </div>

                <div className="p-5">
                    {/* Step 1: Rating & Feedback */}
                    {step === 1 && (
                        <div className="flex flex-col gap-5">
                            {/* Product */}
                            <div className="flex items-center gap-3">
                                <img src={productImage} alt={productName} className="w-12 h-12 object-cover rounded-[8px] bg-gray-50 shrink-0" />
                                <h3 className="font-semibold text-[#0B192C] text-sm line-clamp-2 leading-snug">{productName}</h3>
                            </div>

                            {/* Rating */}
                            <div className="flex flex-col items-center py-4 gap-2">
                                <span className="text-xs font-medium text-[#475569] uppercase tracking-wider">{t('products.reviewModal.rating')}</span>
                                <div
                                    className="flex items-center gap-2"
                                    onMouseLeave={() => setHoveredRating(0)}
                                >
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                        >
                                            {star <= (hoveredRating || rating)
                                                ? <MdStar className="text-[32px] text-[#8A6305] transition-colors" />
                                                : <MdStarOutline className="text-[32px] text-gray-300 transition-colors" />
                                            }
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Feedback */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#0B192C] uppercase tracking-wider">{t('products.reviewModal.feedback')}</label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder={t('products.reviewModal.feedbackPlaceholder')}
                                    rows={3}
                                    className="w-full resize-none rounded-[10px] border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#8A6305] transition-colors placeholder:text-gray-300"
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#0B192C] uppercase tracking-wider">{t('products.reviewModal.uploadImage')}</label>

                                {imagePreview ? (
                                    <div className="relative w-full h-36 rounded-[10px] overflow-hidden group border border-gray-100">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="bg-white text-[#0B192C] px-4 py-2 rounded-[10px] font-medium text-xs"
                                            >
                                                {t('products.reviewModal.changeImage')}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-28 rounded-[10px] border border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 text-[#475569] hover:text-[#0B192C] hover:border-gray-300 transition-colors"
                                    >
                                        <MdCloudUpload className="text-2xl" />
                                        <span className="text-xs font-medium">{t('products.reviewModal.uploadImage')}</span>
                                    </button>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full rounded-[10px] bg-[#0B192C] py-3.5 text-sm font-semibold text-white hover:bg-[#0F172A] transition-colors mt-1"
                            >
                                {t('products.reviewModal.next')}
                            </button>
                        </div>
                    )}

                    {/* Step 2: Personal Details */}
                    {step === 2 && (
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#0B192C] uppercase tracking-wider">
                                    {t('products.reviewModal.name')} <span className="text-gray-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t('products.reviewModal.namePlaceholder')}
                                    className="w-full rounded-[10px] border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#8A6305] transition-colors placeholder:text-gray-300"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#0B192C] uppercase tracking-wider">{t('products.reviewModal.email')}</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('products.reviewModal.emailPlaceholder')}
                                    className="w-full rounded-[10px] border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#8A6305] transition-colors placeholder:text-gray-300"
                                />
                            </div>

                            {/* Summary Preview */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-[10px]">
                                <img src={productImage} alt="" className="w-10 h-10 rounded-[6px] object-cover bg-white shrink-0" />
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className="text-xs text-[#475569] truncate">{productName}</span>
                                    <div className="flex items-center gap-px">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            s <= rating
                                                ? <MdStar key={s} className="text-xs text-[#8A6305]" />
                                                : <MdStarOutline key={s} className="text-xs text-gray-300" />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-1">
                                <button
                                    onClick={() => setStep(1)}
                                    className="w-1/3 rounded-[10px] border border-gray-200 py-3.5 text-sm font-semibold text-[#0B192C] hover:bg-gray-50 transition-colors"
                                >
                                    {t('products.reviewModal.back')}
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !name.trim()}
                                    className="w-2/3 rounded-[10px] bg-[#0B192C] py-3.5 text-sm font-semibold text-white hover:bg-[#0F172A] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        t('products.reviewModal.submit')
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
