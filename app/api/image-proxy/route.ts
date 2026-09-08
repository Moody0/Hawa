import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { recordErrorEvent } from '@/lib/monitoring';

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

const MAX_PROXY_BYTES = 5 * 1024 * 1024; // 5MB maximum proxy response
const CACHE_DIR = path.join(process.cwd(), '.cache', 'image-proxy');

// Ensure cache directory exists synchronously on module init
try {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
} catch {
    // Ignore error if concurrent worker created directory
}

// In-flight deduplication to avoid multiple simultaneous requests for the exact same image
const inFlightRequests = new Map<string, Promise<{ buffer: Buffer; contentType: string }>>();

// Concurrency queue to protect upstream image host (e.g. i.postimg.cc) from being hammered
let activeFetches = 0;
const MAX_CONCURRENT_UPSTREAM = 6;
const fetchQueue: Array<() => void> = [];

function acquireFetchSlot(): Promise<void> {
    if (activeFetches < MAX_CONCURRENT_UPSTREAM) {
        activeFetches++;
        return Promise.resolve();
    }
    return new Promise((resolve) => {
        fetchQueue.push(() => {
            activeFetches++;
            resolve();
        });
    });
}

function releaseFetchSlot() {
    activeFetches--;
    if (fetchQueue.length > 0 && activeFetches < MAX_CONCURRENT_UPSTREAM) {
        const next = fetchQueue.shift();
        next?.();
    }
}

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

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
    return fetch(url, {
        redirect: 'follow',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/*;q=0.8',
        },
        signal: AbortSignal.timeout(timeoutMs),
    });
}

async function fetchFromUpstream(imageUrl: string): Promise<{ buffer: Buffer; contentType: string }> {
    await acquireFetchSlot();
    try {
        const response = await fetchWithTimeout(imageUrl, 5000);

        if (!response.ok) {
            throw new Error(`Upstream returned ${response.status}: ${response.statusText}`);
        }

        const rawContentType = response.headers.get('content-type') || '';
        const contentType = rawContentType.split(';')[0].trim().toLowerCase();

        if (!ALLOWED_MIME_TYPES.has(contentType)) {
            throw new Error(`Disallowed content type: ${contentType}`);
        }

        const contentLengthHeader = response.headers.get('content-length');
        if (contentLengthHeader) {
            const contentLength = parseInt(contentLengthHeader, 10);
            if (!isNaN(contentLength) && contentLength > MAX_PROXY_BYTES) {
                throw new Error('Image size exceeds maximum allowed limit (5MB)');
            }
        }

        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength > MAX_PROXY_BYTES) {
            throw new Error('Image size exceeds maximum allowed limit (5MB)');
        }

        return {
            buffer: Buffer.from(arrayBuffer),
            contentType,
        };
    } finally {
        releaseFetchSlot();
    }
}

function streamBuffer(buffer: Buffer): ReadableStream<Uint8Array> {
    const chunkSize = 64 * 1024;
    let offset = 0;
    return new ReadableStream({
        pull(controller) {
            if (offset >= buffer.length) return controller.close();
            const end = Math.min(offset + chunkSize, buffer.length);
            controller.enqueue(new Uint8Array(buffer.subarray(offset, end)));
            offset = end;
        },
    });
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

    const cacheKey = crypto.createHash('sha256').update(imageUrl).digest('hex');

    try {
        const parsedUrl = new URL(imageUrl);
        // Only HTTPS is permitted
        if (parsedUrl.protocol !== 'https:') {
            return new NextResponse('Invalid protocol: Only HTTPS origins are allowed', { status: 400 });
        }

        const hostname = parsedUrl.hostname.toLowerCase();

        // Check private IP or cloud metadata (SSRF defense)
        if (isPrivateIpOrHost(hostname)) {
            return new NextResponse('Access to private network or metadata is forbidden', { status: 403 });
        }

        // Enforce strict hostname allowlist
        if (!ALLOWED_HOSTS.has(hostname)) {
            return new NextResponse('Image host is not in the allowed list', { status: 403 });
        }

        // 1. Check local persistent disk cache
        const binPath = path.join(CACHE_DIR, `${cacheKey}.bin`);
        const metaPath = path.join(CACHE_DIR, `${cacheKey}.json`);

        try {
            const [metaRaw, data] = await Promise.all([
                fs.promises.readFile(metaPath, 'utf8'),
                fs.promises.readFile(binPath),
            ]);
            const meta = JSON.parse(metaRaw);
            const headers = new Headers();
            headers.set('Content-Type', meta.contentType || 'image/png');
            headers.set('X-Content-Type-Options', 'nosniff');
            headers.set('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable');
            headers.set('X-Cache', 'HIT');
            headers.set('ETag', `"${cacheKey}"`);

            return new NextResponse(streamBuffer(data), { headers });
        } catch {
            // Cache miss: proceed to fetch
        }

        // 2. Fetch from upstream (with in-flight request coalescing)
        let fetchPromise = inFlightRequests.get(cacheKey);
        if (!fetchPromise) {
            fetchPromise = fetchFromUpstream(imageUrl);
            inFlightRequests.set(cacheKey, fetchPromise);
        }

        const { buffer, contentType } = await fetchPromise;

        // 3. Save to disk cache asynchronously without blocking client response
        Promise.all([
            fs.promises.writeFile(binPath, buffer),
            fs.promises.writeFile(
                metaPath,
                JSON.stringify({
                    contentType,
                    size: buffer.length,
                    cachedAt: Date.now(),
                    url: imageUrl,
                })
            ),
        ]).catch((err) => {
            console.error('Failed to write image to disk cache:', err);
        });

        const headers = new Headers();
        headers.set('Content-Type', contentType);
        headers.set('X-Content-Type-Options', 'nosniff');
        headers.set('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable');
        headers.set('X-Cache', 'MISS');
        headers.set('ETag', `"${cacheKey}"`);

        return new NextResponse(streamBuffer(buffer), { headers });
    } catch (error) {
        console.error('Image proxy error for', imageUrl, ':', error);
        recordErrorEvent({ category: 'image_proxy_failure', route: '/api/image-proxy', message: error instanceof Error ? error.message : 'Image proxy failure', status: 502 });
        return NextResponse.redirect(new URL('/placeholder.svg', req.url), 307);
    } finally {
        inFlightRequests.delete(cacheKey);
    }
}
