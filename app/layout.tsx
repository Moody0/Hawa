import type { Metadata, Viewport } from "next";
import { Figtree, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getI18n } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/public-queries";
import { headers } from "next/headers";
import { SITE_ORIGIN } from "@/lib/site-config";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

const noto_sans_arabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic"],
  display: "swap",
});

const metadataBase = SITE_ORIGIN;

export const viewport: Viewport = {
  themeColor: "#0B192C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(metadataBase),
  title: {
    default: "حوا للتوزيع والتجارة | كل منتجات وكالاتك… بطلب واحد - Hawa Distribution",
    template: "%s | Hawa Distribution - حوا للتوزيع",
  },
  description:
    "شركة حوا للتوزيع والتجارة - كل منتجات وكالاتك… بطلب واحد. المنصة الرائدة لتوريد كبرى الوكالات والعلامات التجارية للمحلات والسوبرماركت بالجملة (زوان، الريف، حليبنا، صن بل، سيلفر فيش، بوفالو، روكافيرا، المغربي). توريد مباشر وطلب فوري عبر واتساب.",
  keywords: [
    "Hawa Distribution",
    "حوا للتوزيع والتجارة",
    "شركة حوا للتوزيع",
    "تجارة جملة مواد غذائية",
    "توزيع مواد استهلاكية ومنظفات",
    "وكالات تجارية سوريا",
    "زوان لانشون جملة",
    "زيت الريف جملة",
    "حليبنا مجفف",
    "تونة صن بل",
    "سيلفر فيش سردين",
    "منظفات روكافيرا",
    "منتجات بوفالو",
    "طلب جملة عبر واتساب",
    "تجار جملة سوريا",
    "wholesale distributor B2B",
    "FMCG wholesale Syria",
    "agency distribution B2B"
  ],
  authors: [{ name: "Hawa Distribution & Trading", url: metadataBase }],
  creator: "Hawa Distribution & Trading",
  publisher: "Hawa Distribution & Trading",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "ar-SY": "/",
      "en-US": "/?lang=en",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_SY",
    alternateLocale: ["en_US"],
    siteName: "حوا للتوزيع والتجارة | Hawa Distribution & Trading",
    title: "حوا للتوزيع والتجارة | كل منتجات وكالاتك… بطلب واحد - Hawa Distribution",
    description:
      "شركة حوا للتوزيع والتجارة - المنصة الرائدة لتوريد كبرى الوكالات والعلامات التجارية للمحلات والسوبرماركت بالجملة (زوان، الريف، حليبنا، صن بل، سيلفر فيش، بوفالو، روكافيرا، المغربي). توريد مباشر وطلب فوري عبر واتساب.",
    url: metadataBase,
    images: [
      {
        url: `${metadataBase}/og-image.jpg`,
        secureUrl: `${metadataBase}/og-image.jpg`,
        width: 1080,
        height: 1080,
        type: "image/jpeg",
        alt: "حوا للتوزيع والتجارة | كل منتجات وكالاتك… بطلب واحد - Hawa Distribution",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "حوا للتوزيع والتجارة | كل منتجات وكالاتك… بطلب واحد - Hawa Distribution",
    description:
      "شركة حوا للتوزيع والتجارة - المنصة الرائدة لتوريد كبرى الوكالات والعلامات التجارية للمحلات والسوبرماركت بالجملة. توريد مباشر وطلب فوري عبر واتساب.",
    images: [`${metadataBase}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=hawa_3", sizes: "any" },
      { url: "/favicon-32x32.png?v=hawa_3", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png?v=hawa_3", type: "image/png", sizes: "16x16" },
      { url: "/icon.png?v=hawa_3", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico?v=hawa_3",
    apple: [
      { url: "/apple-touch-icon.png?v=hawa_3", sizes: "180x180", type: "image/png" },
    ],
  },
  category: "food & beverage",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let requestLocale: 'en' | 'ar' = 'ar';
  try {
    const headersList = await headers();
    if (headersList.get('x-locale') === 'en') {
      requestLocale = 'en';
    }
  } catch {}

  const [{ language, dir }, settings] = await Promise.all([
    getI18n(requestLocale),
    getSiteSettings(),
  ]);
  const exchangeRate = settings?.exchangeRate ? Number(settings.exchangeRate) : 135;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "WholesaleStore",
    "name": "Hawa Distribution & Trading - حوا للتوزيع والتجارة",
    "url": metadataBase,
    "logo": `${metadataBase}/logo.png`,
    "image": `${metadataBase}/og-image.jpg`,
    "description": "شركة حوا للتوزيع والتجارة - المنصة الرائدة لعرض وتوزيع منتجات الوكالات للمحلات والتجار بالجملة.",
    "currenciesAccepted": "SYP, USD",
    "paymentAccepted": "Cash, Bank Transfer",
    "areaServed": "Syria",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "SY"
    }
  };

  return (
    <html lang={language} dir={dir} suppressHydrationWarning className={`${figtree.variable} ${noto_sans_arabic.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, '\\u003c') }}
        />
        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              prefetch: [
                {
                  where: {
                    and: [
                      {
                        or: [
                          { href_matches: "/products/*" },
                          { href_matches: "/brands/*" },
                          { href_matches: "/categories/*" },
                          { href_matches: "/departments/*" },
                        ],
                      },
                      { not: { href_matches: "/admin/*" } },
                      { not: { href_matches: "/api/*" } },
                      { not: { href_matches: "/account/*" } },
                      { not: { href_matches: "/cart" } },
                      { not: { href_matches: "/place-order" } },
                      { not: { href_matches: "/complete-order" } },
                    ],
                  },
                  eagerness: "conservative",
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${figtree.className} ${noto_sans_arabic.className} antialiased`}
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[#0B192C] focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#8A6305] font-bold text-sm"
        >
          {language === 'ar' ? 'تخطي إلى المحتوى الرئيسي' : 'Skip to main content'}
        </a>
        <div id="app-shell">
          <Providers initialExchangeRate={exchangeRate} initialLanguage={language}>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
