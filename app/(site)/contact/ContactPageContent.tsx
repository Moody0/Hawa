"use client";

import React, { useState, useRef } from "react";
import { Phone, MapPin, Clock, Store, Send, CheckCircle2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";
import { useLanguage } from "@/app/context/LanguageContext";
import { ContactPageContent as ContactPageContentType } from "@/lib/contact-page-content";

interface ContactPageContentProps {
    siteSettings: any;
    content: ContactPageContentType;
}

export default function ContactPageContent({ siteSettings, content }: ContactPageContentProps) {
    const { dir, language } = useLanguage();
    const isAr = language === "ar" || dir === "rtl";
    const pageContent = isAr ? content.ar : content.en;

    // Numbers cleanup
    const cleanNumber = (val?: string) => (val || "").replace(/[^0-9]/g, "");

    const salesWaClean = cleanNumber(pageContent.salesWhatsapp || siteSettings?.whatsappNumber || "+963993443901");
    const gmWaClean = cleanNumber(pageContent.gmWhatsapp || "+963994166000");

    const [formData, setFormData] = useState({
        shopName: "",
        name: "",
        phone: "",
        city: isAr ? "حمص" : "Homs",
        message: "",
    });

    const submitBtnLabel = React.useMemo(() => {
        const raw = pageContent.formSubmitBtn;
        if (!raw || raw.includes("واتساب") || raw.toLowerCase().includes("whatsapp")) {
            return isAr ? "إرسال الرسالة" : "Send Message";
        }
        return raw;
    }, [pageContent.formSubmitBtn, isAr]);

    const formDescription = React.useMemo(() => {
        const raw = pageContent.formDesc;
        if (!raw || raw.includes("واتساب") || raw.toLowerCase().includes("whatsapp")) {
            return isAr
                ? "اكتب تفاصيل طلبك أو استفسارك وسيتم إرسالها إلى إدارتنا لمتابعتها والتواصل معكم مباشرة."
                : "Enter your inquiry or order details and our team will review and reply to you directly.";
        }
        return raw;
    }, [pageContent.formDesc, isAr]);

    const formTitle = React.useMemo(() => {
        const raw = pageContent.formTitle;
        if (!raw || raw.includes("واتساب") || raw.toLowerCase().includes("whatsapp")) {
            return isAr ? "أرسل رسالة أو استفساراً" : "Send an Inquiry or Message";
        }
        return raw;
    }, [pageContent.formTitle, isAr]);

    const [honeypot, setHoneypot] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const mountTimestamp = useRef(Date.now());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
            toast.error(
                isAr
                    ? "يرجى كتابة الاسم ورقم الهاتف ونص الرسالة"
                    : "Please fill in your name, phone number, and message"
            );
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    shopName: formData.shopName,
                    city: formData.city,
                    message: formData.message,
                    _hp_company: honeypot,
                    _ts: mountTimestamp.current,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success(
                    isAr
                        ? "تم إرسال رسالتكم بنجاح! سيتواصل معكم فريقنا قريباً."
                        : "Your message has been sent successfully! Our team will get back to you shortly."
                );
                setIsSubmitted(true);
                setFormData({
                    shopName: "",
                    name: "",
                    phone: "",
                    city: isAr ? "حمص" : "Homs",
                    message: "",
                });
            } else {
                toast.error(
                    data.error ||
                        (isAr
                            ? "فشل إرسال الرسالة، يرجى المحاولة لاحقاً"
                            : "Failed to send message. Please try again later.")
                );
            }
        } catch (error) {
            console.error("Failed to submit contact message:", error);
            toast.error(
                isAr
                    ? "حدث خطأ في الاتصال، يرجى المحاولة لاحقاً"
                    : "Connection error. Please try again later."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container-custom py-10 md:py-16" dir={dir}>
            {/* Header: Badge removed as requested */}
            <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B192C] dark:text-white tracking-tight leading-tight mb-4">
                    {pageContent.heroTitle}
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-[#475569] dark:text-gray-300 max-w-xl mx-auto leading-relaxed whitespace-pre-line">
                    {pageContent.heroDescription}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Contact Cards (Left 5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                    {/* Sales Manager Dedicated Card */}
                    <div className="bg-gradient-to-br from-emerald-500/10 via-[#25D366]/5 to-transparent border border-emerald-500/30 hover:border-emerald-500 rounded-3xl p-6 transition-all shadow-xs hover:shadow-md">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center text-3xl shrink-0 shadow-sm">
                                <FaWhatsapp />
                            </div>
                            <div className="flex-1 min-w-0">
                                {pageContent.salesTag && (
                                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-extrabold mb-1">
                                        {pageContent.salesTag}
                                    </span>
                                )}
                                <h3 className="text-base sm:text-lg font-black text-[#0B192C] dark:text-white leading-tight">
                                    {pageContent.salesTitle}
                                </h3>
                                <p className="text-xs text-[#475569] dark:text-gray-300 mt-1 leading-relaxed whitespace-pre-line">
                                    {pageContent.salesDesc}
                                </p>
                                {pageContent.salesPhone && (
                                    <p className="text-sm font-extrabold text-[#0B192C] dark:text-white mt-2 font-mono" dir="ltr">
                                        {pageContent.salesPhone}
                                    </p>
                                )}
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-emerald-500/20 flex-wrap">
                                    <a
                                        href={`https://wa.me/${salesWaClean}?text=${encodeURIComponent(pageContent.salesWhatsappMsg || "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold transition-all shadow-xs"
                                    >
                                        <FaWhatsapp className="text-sm" />
                                        <span>{pageContent.salesWhatsappBtn}</span>
                                    </a>
                                    {pageContent.salesPhone && (
                                        <a
                                            href={`tel:${pageContent.salesPhone.replace(/\s+/g, '')}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-white/10 text-[#0B192C] dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-700 text-xs font-bold transition-all shadow-xs"
                                        >
                                            <Phone className="w-3.5 h-3.5" />
                                            <span>{pageContent.salesCallBtn}</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Company General Manager Dedicated Card */}
                    <div className="bg-gradient-to-br from-[#FAF6EC] via-amber-50/40 to-transparent dark:from-[#132035] dark:via-[#0B192C] border border-[#8A6305]/30 hover:border-[#8A6305] rounded-3xl p-6 transition-all shadow-xs hover:shadow-md">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#0B192C] dark:bg-[#8A6305] text-[#8A6305] dark:text-white border border-[#8A6305]/40 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                                <Store className="text-3xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                                {pageContent.gmTag && (
                                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#8A6305]/10 text-[#8A6305] dark:text-[#8A6305] text-[11px] font-extrabold mb-1">
                                        {pageContent.gmTag}
                                    </span>
                                )}
                                <h3 className="text-base sm:text-lg font-black text-[#0B192C] dark:text-white leading-tight">
                                    {pageContent.gmTitle}
                                </h3>
                                <p className="text-xs text-[#475569] dark:text-gray-300 mt-1 leading-relaxed whitespace-pre-line">
                                    {pageContent.gmDesc}
                                </p>
                                {pageContent.gmPhone && (
                                    <p className="text-sm font-extrabold text-[#0B192C] dark:text-white mt-2 font-mono" dir="ltr">
                                        {pageContent.gmPhone}
                                    </p>
                                )}
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#8A6305]/20 flex-wrap">
                                    {pageContent.gmPhone && (
                                        <a
                                            href={`tel:${pageContent.gmPhone.replace(/\s+/g, '')}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B192C] hover:bg-[#1a2e4c] dark:bg-[#8A6305] dark:hover:bg-[#725204] text-white text-xs font-bold transition-all shadow-xs"
                                        >
                                            <Phone className="w-3.5 h-3.5" />
                                            <span>{pageContent.gmCallBtn}</span>
                                        </a>
                                    )}
                                    <a
                                        href={`https://wa.me/${gmWaClean}?text=${encodeURIComponent(pageContent.gmWhatsappMsg || "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-700 text-xs font-bold transition-all shadow-xs"
                                    >
                                        <FaWhatsapp className="text-sm" />
                                        <span>{pageContent.gmWhatsappBtn}</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Central Warehouse & Headquarters */}
                    <div className="bg-white dark:bg-[#132035] rounded-3xl p-6 border border-gray-200/80 dark:border-white/10 shadow-xs">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#FAF6EC] dark:bg-white/5 border border-[#8A6305]/20 text-[#8A6305] dark:text-[#8A6305] flex items-center justify-center text-2xl shrink-0">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-[#0B192C] dark:text-white mb-1">
                                    {pageContent.warehouseTitle}
                                </h4>
                                <p className="text-xs text-[#475569] dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                    {pageContent.warehouseDesc}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Business Working Hours */}
                    <div className="bg-white dark:bg-[#132035] rounded-3xl p-6 border border-gray-200/80 dark:border-white/10 shadow-xs">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#FAF6EC] dark:bg-white/5 border border-[#8A6305]/20 text-[#8A6305] dark:text-[#8A6305] flex items-center justify-center text-2xl shrink-0">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-[#0B192C] dark:text-white mb-1">
                                    {pageContent.hoursTitle}
                                </h4>
                                <p className="text-xs text-[#475569] dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                    {pageContent.hoursDesc}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Direct Message Form (Right 7 cols) */}
                <div className="lg:col-span-7 bg-white dark:bg-[#132035] p-6 sm:p-8 md:p-10 rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-md">
                    <div className="mb-6">
                        <h3 className="text-xl font-black text-[#0B192C] dark:text-white mb-1">
                            {formTitle}
                        </h3>
                        <p className="text-xs text-[#475569] dark:text-gray-400 whitespace-pre-line">
                            {formDescription}
                        </p>
                    </div>

                    {isSubmitted ? (
                        <div className="py-8 px-6 text-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 animate-in fade-in-50 duration-200">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl mx-auto mb-3 shadow-sm">
                                <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                                {isAr ? "تم استلام رسالتكم بنجاح" : "Message Received Successfully"}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
                                {isAr
                                    ? "شكراً لتواصلكم مع شركة حوا للتوزيع. تم تحويل رسالتكم إلى إدارتنا المختصة، وسيتواصل معكم فريقنا خلال أوقات الدوام الرسمي."
                                    : "Thank you for reaching out to Hawa Distribution. Your message has been received by our management team, and we will follow up with you promptly."}
                            </p>
                            <button
                                type="button"
                                onClick={() => setIsSubmitted(false)}
                                className="mt-5 px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity"
                            >
                                {isAr ? "إرسال رسالة أخرى" : "Send Another Message"}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Honeypot field for bot spam trap */}
                            <div className="hidden" aria-hidden="true">
                                <label htmlFor="company_website_hp">Website</label>
                                <input
                                    id="company_website_hp"
                                    type="text"
                                    name="_hp_company"
                                    value={honeypot}
                                    onChange={(e) => setHoneypot(e.target.value)}
                                    tabIndex={-1}
                                    autoComplete="off"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="contact-name" className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                                        {pageContent.formNameLabel}
                                    </label>
                                    <input
                                        id="contact-name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                        placeholder={pageContent.formNamePlaceholder}
                                        className="block w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:border-[#8A6305] focus:ring-0 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="contact-shopName" className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                                        {pageContent.formShopLabel}
                                    </label>
                                    <input
                                        id="contact-shopName"
                                        type="text"
                                        value={formData.shopName}
                                        onChange={(e) => setFormData(p => ({ ...p, shopName: e.target.value }))}
                                        placeholder={pageContent.formShopPlaceholder}
                                        className="block w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:border-[#8A6305] focus:ring-0 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="contact-phone" className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                                        {pageContent.formPhoneLabel}
                                    </label>
                                    <input
                                        id="contact-phone"
                                        type="tel"
                                        required
                                        dir="ltr"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                                        placeholder={pageContent.formPhonePlaceholder}
                                        className="block w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:border-[#8A6305] focus:ring-0 focus:outline-none transition-colors font-mono"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="contact-city" className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                                        {pageContent.formCityLabel}
                                    </label>
                                    <input
                                        id="contact-city"
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                                        placeholder={pageContent.formCityPlaceholder}
                                        className="block w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:border-[#8A6305] focus:ring-0 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="contact-message" className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                                    {pageContent.formMessageLabel}
                                </label>
                                <textarea
                                    id="contact-message"
                                    rows={4}
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                                    placeholder={pageContent.formMessagePlaceholder}
                                    className="block w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:border-[#8A6305] focus:ring-0 focus:outline-none transition-colors resize-y"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3.5 px-4 rounded-xl bg-[#0B192C] hover:bg-[#1a2e4c] text-white font-extrabold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                                        <span>{isAr ? "جاري الإرسال..." : "Sending..."}</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span>{submitBtnLabel}</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
