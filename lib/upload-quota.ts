/**
 * In-memory sliding window rate limiter for file uploads per user/customer.
 */
interface UploadRecord {
    count: number;
    windowStart: number;
}

const uploadTracker = new Map<string, UploadRecord>();

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_UPLOADS_PER_WINDOW = 20; // 20 uploads per 10 minutes

export function checkUploadQuota(identifier: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const record = uploadTracker.get(identifier);

    if (!record || now - record.windowStart > WINDOW_MS) {
        uploadTracker.set(identifier, { count: 1, windowStart: now });
        return { allowed: true, remaining: MAX_UPLOADS_PER_WINDOW - 1 };
    }

    if (record.count >= MAX_UPLOADS_PER_WINDOW) {
        return { allowed: false, remaining: 0 };
    }

    record.count += 1;
    return { allowed: true, remaining: MAX_UPLOADS_PER_WINDOW - record.count };
}

export function resetUploadQuota(identifier: string) {
    uploadTracker.delete(identifier);
}
