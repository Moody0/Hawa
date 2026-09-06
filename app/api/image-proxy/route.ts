import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ALLOWED_HOSTS = new Set([
    'fatoradrive.blob.core.windows.net',
    'lh3.googleusercontent.com',
    'images.unsplash.com',
    'cdn.shopify.com',
    'i.postimg.cc',
]);

const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
]);

function isPrivateIpOrHost(hostname: string): boolean {
    const host = hostname.toLowerCase().trim();
    if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) {
        return true;
    }
    // IPv4 private & link-local ranges
    if (
        host === '127.0.0.1' ||
        host.startsWith('127.') ||
        host.startsWith('10.') ||
        host.startsWith('192.168.') ||
        host.startsWith('169.254.') || // Cloud metadata endpoint (AWS, Azure, GCP, DO)
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
    ) {
        return true;
    }
    // IPv6 loopback
    if (host === '::1' || host === '[::1]') {
        return true;
    }
    return false;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    let imageUrl = searchParams.get('url');

    if (!imageUrl) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    imageUrl = imageUrl.trim();

    // Prevent recursive proxy loops or invalid relative URLs
    if (imageUrl.startsWith('/') || imageUrl.includes('/api/image-proxy')) {
        return new NextResponse('Invalid image URL', { status: 400 });
    }

    try {
        const parsedUrl = new URL(imageUrl);
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
            return new NextResponse('Invalid protocol', { status: 400 });
        }

        const hostname = parsedUrl.hostname.toLowerCase();

        // Check private IP or cloud metadata
        if (isPrivateIpOrHost(hostname)) {
            return new NextResponse('Access to private network or metadata is forbidden', { status: 403 });
        }

        // Enforce strict hostname allowlist
        if (!ALLOWED_HOSTS.has(hostname)) {
            return new NextResponse('Image host is not in the allowed list', { status: 403 });
        }

        const response = await fetch(imageUrl, {
            redirect: 'error',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/*;q=0.8',
            },
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            return new NextResponse(`Failed to fetch image: ${response.statusText}`, { status: response.status });
        }

        const rawContentType = response.headers.get('content-type') || '';
        const contentType = rawContentType.split(';')[0].trim().toLowerCase();

        // Block non-image or potentially dangerous MIME types (e.g. SVG scripts, HTML)
        if (!ALLOWED_MIME_TYPES.has(contentType)) {
            return new NextResponse('Disallowed or dangerous content type', { status: 415 });
        }

        const buffer = await response.arrayBuffer();

        const headers = new Headers();
        headers.set('Content-Type', contentType);
        headers.set('X-Content-Type-Options', 'nosniff');
        headers.set('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable');

        return new NextResponse(buffer, { headers });
    } catch (error) {
        console.error('Image proxy error:', error);
        return new NextResponse('Failed to load remote image', { status: 502 });
    }
}
