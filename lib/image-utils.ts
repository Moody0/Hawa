export const IMAGE_PLACEHOLDER_SRC = "/placeholder.svg";

export const isValidImageSrc = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed) return false;
    
    // Valid relative path
    if (trimmed.startsWith('/')) return true;
    
    // Valid data URI
    if (trimmed.startsWith('data:image/')) return true;

    // Must start with http:// or https://
    if (/^https?:\/\//i.test(trimmed)) {
        try {
            new URL(trimmed);
            return true;
        } catch {
            return false;
        }
    }

    return false;
};

const isRemoteImageUrl = (url: string) => /^https?:\/\//i.test(url);

export const getProxyImageUrl = (url: string) => `/api/image-proxy?url=${encodeURIComponent(url)}`;

const cleanUrl = (url: string): string => {
    let cleaned = url.trim();
    if (cleaned.includes('/api/image-proxy?url=')) {
        try {
            const urlParam = cleaned.split('url=')[1].split('&')[0];
            cleaned = decodeURIComponent(urlParam);
        } catch {
            // ignore
        }
    }
    return cleaned;
};

/**
 * Returns a safe image URL. Remote URLs stay remote so Next/Image can send
 * them through the platform's built-in optimizer and CDN without an extra
 * application-function hop.
 */
export const getSafeImageUrl = (url: string | null | undefined): string => {
    if (!url || !isValidImageSrc(url)) return IMAGE_PLACEHOLDER_SRC;

    const trimmedUrl = cleanUrl(url);

    // Local paths and data URIs are already on the domain
    if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('data:')) {
        return trimmedUrl;
    }

    // Next/Image turns configured remote sources into same-origin /_next/image
    // requests, so users do not connect to the remote host directly.
    if (isRemoteImageUrl(trimmedUrl)) {
        return trimmedUrl;
    }

    return trimmedUrl || IMAGE_PLACEHOLDER_SRC;
};

export const parseImageList = (images: string | null | undefined): string[] => {
    if (!images) {
        return [];
    }

    return images
        .split(",")
        .map((img) => img.trim())
        .filter(isValidImageSrc);
};

export const getPrimaryImage = (images: string | null | undefined): string =>
    parseImageList(images)[0] || IMAGE_PLACEHOLDER_SRC;

/**
 * Generates an ordered list of fallback candidates:
 * 1. Direct remote URL through Next/Image's optimizer and CDN
 * 2. Fallback placeholder SVG
 */
export const getImageSourceCandidates = (
    url: string | null | undefined,
    fallbackSrc: string = IMAGE_PLACEHOLDER_SRC
): string[] => {
    if (!url || !isValidImageSrc(url)) {
        return [fallbackSrc];
    }

    const trimmedUrl = cleanUrl(url);

    if (!trimmedUrl || !isValidImageSrc(trimmedUrl)) {
        return [fallbackSrc];
    }

    // If local or data URI, direct load is optimal
    if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('data:')) {
        return [trimmedUrl, fallbackSrc];
    }

    const candidates = [
        trimmedUrl,
        fallbackSrc,
    ];

    return [...new Set(candidates.filter(isValidImageSrc))];
};
