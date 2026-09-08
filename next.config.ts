import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs/config';

const productionScriptSources = "'self' 'unsafe-inline' https://va.vercel-scripts.com";
const developmentScriptSources = `${productionScriptSources} 'unsafe-eval'`;

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: `default-src 'self'; script-src ${process.env.NODE_ENV === 'production' ? productionScriptSources : developmentScriptSources}; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https://fatoradrive.blob.core.windows.net https://lh3.googleusercontent.com https://images.unsplash.com https://cdn.shopify.com https://i.postimg.cc; font-src 'self' data: https:; connect-src 'self' https://aws-0-eu-central-1.pooler.supabase.com https://*.supabase.co https://*.ingest.sentry.io https://wa.me; object-src 'none'; base-uri 'self'; form-action 'self' https://wa.me; frame-ancestors 'self';`,
  },
  {
    key: 'Content-Security-Policy-Report-Only',
    value: "default-src 'self'; script-src 'self' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://fatoradrive.blob.core.windows.net https://lh3.googleusercontent.com https://images.unsplash.com https://cdn.shopify.com https://i.postimg.cc; font-src 'self' data:; connect-src 'self' https://aws-0-eu-central-1.pooler.supabase.com https://*.supabase.co https://*.ingest.sentry.io; object-src 'none'; base-uri 'self'; form-action 'self' https://wa.me; frame-ancestors 'self'; report-uri /api/csp-report;",
  },
];

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },
  images: {
    unoptimized: false,
    localPatterns: [
      {
        // Preserve the default behavior for existing local assets while also
        // allowing the query-string based, allowlisted image proxy endpoint.
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    qualities: [60, 75, 85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fatoradrive.blob.core.windows.net",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "i.postimg.cc",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        // Product and brand uploads are content-addressed by their path. Keep
        // them in the browser/CDN cache so scrolling back does not re-hit the
        // origin or image optimizer for the same asset.
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/agencies',
        destination: '/brands',
        permanent: true,
      },
      {
        source: '/agencies/:slug',
        destination: '/brands/:slug',
        permanent: true,
      },
      {
        source: '/department/:slug',
        destination: '/departments/:slug',
        permanent: true,
      },
    ];
  },
};

const analyzedConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);

export default withSentryConfig(analyzedConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  sourcemaps: { deleteSourcemapsAfterUpload: true },
});
