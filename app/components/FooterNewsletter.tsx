'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';

interface FooterNewsletterProps {
    language: string;
}

export default function FooterNewsletter({ language }: FooterNewsletterProps) {
    const isArabic = language === 'ar';
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            setStatus('error');
            return;
        }

        setStatus('loading');
        // Simulate response
        await new Promise((resolve) => setTimeout(resolve, 600));
        setStatus('success');
        setEmail('');
    };

    if (status === 'success') {
        return (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium animate-in fade-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                    {isArabic
                        ? 'تم الاشتراك بنجاح! ستصلك آخر العروض.'
                        : 'Subscribed! You will receive our latest updates.'}
                </span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
            <div className="relative flex items-center w-full">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === 'error') setStatus('idle');
                    }}
                    placeholder={isArabic ? 'البريد الإلكتروني...' : 'Enter your email...'}
                    required
                    dir={isArabic ? 'rtl' : 'ltr'}
                    className="w-full bg-[#081220] text-slate-100 placeholder-slate-400 text-xs sm:text-[13px] rounded-lg ps-3.5 pe-24 py-2.5 border border-white/15 focus:border-[#8A6305] focus:ring-0 focus:outline-none transition-colors"
                />
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="absolute end-1 top-1 bottom-1 px-3.5 bg-[#8A6305] hover:bg-[#9E7307] active:bg-[#735204] text-white rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-70 cursor-pointer"
                >
                    {status === 'loading' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <>
                            <span>{isArabic ? 'اشترك' : 'Subscribe'}</span>
                            <Send className="w-3 h-3 rtl:-scale-x-100" />
                        </>
                    )}
                </button>
            </div>
            {status === 'error' && (
                <span className="text-[11px] text-rose-400 font-medium ps-1">
                    {isArabic ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address'}
                </span>
            )}
        </form>
    );
}
