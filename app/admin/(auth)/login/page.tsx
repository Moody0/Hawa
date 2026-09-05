"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import LanguageToggle from "@/app/components/LanguageToggle";
import { MdPerson, MdLock } from "react-icons/md";

export default function AdminLoginPage() {
    const router = useRouter();
    const { t, dir } = useLanguage();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                username,
                password,
                rememberMe: rememberMe ? "true" : "false",
                redirect: false,
            });

            if (result?.error) {
                setError(t("admin.login.invalidCredentials"));
                setLoading(false);
            } else if (result?.ok) {
                const rawCallback = new URLSearchParams(window.location.search).get("callbackUrl");
                const destination = (rawCallback && !rawCallback.startsWith("/admin/login")) 
                    ? rawCallback 
                    : "/admin/dashboard";
                window.location.href = destination;
            } else {
                setError(t("admin.login.errorGeneric"));
                setLoading(false);
            }
        } catch (err) {
            setError(t("admin.login.errorGeneric"));
            console.error(err);
            setLoading(false);
        }
    };

    const isRtl = dir === "rtl";
    const inputPadding = isRtl ? "pe-11 ps-4" : "ps-11 pe-4";

    return (
        <div
            className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#fafafa] dark:bg-[#111111]"
            dir={dir}
        >
            <div className="absolute top-8 end-8 z-20">
                <LanguageToggle />
            </div>
            <div className="w-full max-w-[420px] z-10">
                <div className="bg-white dark:bg-surface-dark rounded-[24px] border border-black/[0.04] dark:border-white/[0.04] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] dark:shadow-none p-10 md:p-12 transition-all">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-10 text-center">
                        <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-2xl mb-6 p-2 flex items-center justify-center shadow-inner">
                            <img
                                src="/logo.jpeg"
                                alt="Hawa Distribution"
                                className="h-full w-full object-contain rounded-xl"
                            />
                        </div>
                        <h1 className="text-text-main dark:text-white text-2xl font-bold tracking-tight">
                            {t("admin.login.welcomeBack")}
                        </h1>
                        <p className="text-text-sub dark:text-gray-400 text-sm mt-2 font-medium">
                            {t("admin.login.subtitle")}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50/80 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {/* Username Field */}
                        <div className="space-y-2">
                            <label
                                className={`text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400 ${isRtl ? "me-1" : "ms-1"}`}
                                htmlFor="username"
                            >
                                {t("admin.login.username")}
                            </label>
                            <div className="relative group">
                                <span className={`absolute inset-y-0 ${isRtl ? "end-0" : "start-0"} flex items-center ${isRtl ? "pe-4" : "ps-4"} text-gray-400 group-focus-within:text-primary transition-colors`}>
                                    <MdPerson className="text-[20px]" />
                                </span>
                                <input
                                    className={`w-full ${inputPadding} py-3.5 bg-gray-50/50 dark:bg-black/20 border border-black/[0.04] dark:border-white/[0.04] rounded-xl focus:bg-white dark:focus:bg-surface-dark focus:ring-4 focus:ring-primary/10 focus:border-primary text-text-main dark:text-white placeholder:text-gray-400 transition-all outline-none font-medium`}
                                    id="username"
                                    placeholder={t("admin.login.usernamePlaceholder")}
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label
                                    className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400"
                                    htmlFor="password"
                                >
                                    {t("admin.login.password")}
                                </label>
                            </div>
                            <div className="relative group">
                                <span className={`absolute inset-y-0 ${isRtl ? "end-0" : "start-0"} flex items-center ${isRtl ? "pe-4" : "ps-4"} text-gray-400 group-focus-within:text-primary transition-colors`}>
                                    <MdLock className="text-[20px]" />
                                </span>
                                <input
                                    className={`w-full ${inputPadding} py-3.5 bg-gray-50/50 dark:bg-black/20 border border-black/[0.04] dark:border-white/[0.04] rounded-xl focus:bg-white dark:focus:bg-surface-dark focus:ring-4 focus:ring-primary/10 focus:border-primary text-text-main dark:text-white placeholder:text-gray-400 transition-all outline-none font-medium`}
                                    id="password"
                                    placeholder={t("admin.login.passwordPlaceholder")}
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    className="w-4 h-4 rounded border-black/10 dark:border-white/10 text-primary focus:ring-primary/20 transition-all"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span className="text-sm font-medium text-text-sub dark:text-gray-400 group-hover:text-text-main dark:group-hover:text-gray-200 transition-colors">
                                    {t("admin.login.rememberMe")}
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all transform active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? t("admin.login.signingIn") : t("admin.login.submitButton")}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
