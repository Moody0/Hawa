const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const prisma = new PrismaClient();
const configuredMediaRoot = process.env.MEDIA_STORAGE_DIR;
const CACHE_DIR = configuredMediaRoot && path.isAbsolute(configuredMediaRoot)
    ? path.join(path.resolve(configuredMediaRoot), '.image-proxy-cache')
    : path.join(__dirname, '..', '.cache', 'image-proxy');

async function prewarmImages() {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    try {
        const products = await prisma.product.findMany({
            select: { images: true }
        });

        const urls = new Set();
        for (const p of products) {
            const list = (p.images || '').split(',').map(s => s.trim()).filter(Boolean);
            for (const u of list) {
                if (u.startsWith('http')) {
                    urls.add(u);
                }
            }
        }

        const uniqueUrls = Array.from(urls);
        console.log(`Checking ${uniqueUrls.length} unique remote product images for disk cache...`);

        let cachedCount = 0;
        const toFetch = [];

        for (const url of uniqueUrls) {
            const key = crypto.createHash('sha256').update(url).digest('hex');
            const binPath = path.join(CACHE_DIR, `${key}.bin`);
            const jsonPath = path.join(CACHE_DIR, `${key}.json`);

            if (fs.existsSync(binPath) && fs.existsSync(jsonPath)) {
                cachedCount++;
            } else {
                toFetch.push({ url, key, binPath, jsonPath });
            }
        }

        console.log(`Already cached on disk: ${cachedCount} / ${uniqueUrls.length}`);
        if (toFetch.length === 0) {
            console.log('✅ All product images are already cached locally on disk!');
            return;
        }

        console.log(`Downloading ${toFetch.length} missing images with safe concurrency (limit 5)...`);

        let downloaded = 0;
        let errors = 0;

        async function pool(items, limit, fn) {
            const executing = new Set();
            for (const item of items) {
                const p = Promise.resolve().then(() => fn(item));
                executing.add(p);
                p.finally(() => executing.delete(p));
                if (executing.size >= limit) {
                    await Promise.race(executing);
                }
            }
            await Promise.all(executing);
        }

        await pool(toFetch, 5, async (item) => {
            try {
                const res = await fetch(item.url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                        'Accept': 'image/avif,image/webp,image/apng,image/*;q=0.8',
                    },
                    signal: AbortSignal.timeout(15000),
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const contentType = (res.headers.get('content-type') || 'image/png').split(';')[0].trim();
                const buffer = Buffer.from(await res.arrayBuffer());

                fs.writeFileSync(item.binPath, buffer);
                fs.writeFileSync(
                    item.jsonPath,
                    JSON.stringify({
                        contentType,
                        size: buffer.length,
                        cachedAt: Date.now(),
                        url: item.url,
                    })
                );

                downloaded++;
                if (downloaded % 15 === 0 || downloaded === toFetch.length) {
                    console.log(`Progress: ${downloaded}/${toFetch.length} downloaded...`);
                }
            } catch (err) {
                errors++;
                console.error(`Failed to pre-warm ${item.url}: ${err.message}`);
            }
        });

        console.log(`\nPre-warm complete: ${downloaded} downloaded, ${errors} failed.`);
    } finally {
        await prisma.$disconnect();
    }
}

prewarmImages().catch(console.error);
