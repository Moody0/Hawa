import type { Metadata, Viewport } from "next";
import { Figtree, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getI18n } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/admin-actions";

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

const metadataBase =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  "https://hawatrading.com";

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
    alternateLocale: ["en_US", "ar_SA"],
    siteName: "Hawa Distribution | حوا للتوزيع والتجارة",
    title: "Hawa Distribution & Trading | Wholesale Agencies - حوا للتوزيع والتجارة",
    description:
      "شركة حوا للتوزيع والتجارة - المنصة الرائدة لعرض وتوزيع منتجات الوكالات للمحلات والتجار بالجملة. توريد مباشر وطلب سريع عبر واتساب.",
    url: metadataBase,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Hawa Distribution & Trading",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hawa Distribution & Trading | Wholesale Agencies - حوا للتوزيع والتجارة",
    description:
      "شركة حوا للتوزيع والتجارة - المنصة الرائدة لعرض وتوزيع منتجات الوكالات للمحلات والتجار بالجملة. توريد مباشر وطلب سريع عبر واتساب.",
    images: ["/og-image.jpg"],
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
      { url: "/favicon.ico?v=2", sizes: "any" },
      { url: "/favicon-32x32.png?v=2", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png?v=2", type: "image/png", sizes: "16x16" },
      { url: "/icon.png?v=2", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: [
      { url: "/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" },
    ],
  },
  category: "food & beverage",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [{ language, dir }, settings] = await Promise.all([
    getI18n(),
    getSiteSettings(),
  ]);
  const exchangeRate = settings?.exchangeRate ? Number(settings.exchangeRate) : 135;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "WholesaleStore",
    "name": "Hawa Distribution & Trading - حوا للتوزيع والتجارة",
    "url": metadataBase,
    "logo": `${metadataBase}/logo.jpeg`,
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              prerender: [
                {
                  where: {
                    and: [
                      { href_matches: "/*" },
                      { not: { href_matches: "/admin/*" } },
                      { not: { href_matches: "/api/*" } },
                    ],
                  },
                  eagerness: "moderate",
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
        <div id="app-shell">
          <Providers initialExchangeRate={exchangeRate} initialLanguage={language}>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
