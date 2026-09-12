import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { getValidAdminSession, requireAdminSession } from "@/lib/admin-auth";
import { getAuthenticatedCustomer } from "@/lib/customer-auth";
import sharp from "sharp";
import { checkUploadQuota } from "@/lib/upload-quota";
import { getMediaStorageRoot } from "@/lib/media-storage";
import type { AdminPermission } from "@/lib/admin-permissions";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DIMENSION = 4096; // 4096px max width or height
const MAX_INPUT_PIXELS = 16777216; // 16 Megapixels limit to prevent decompression bombs

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// Magic byte verification for common image types
function validateImageMagicBytes(buffer: Buffer, ext: string): boolean {
    if (buffer.length < 12) return false;

    // JPEG: FF D8 FF
    if ((ext === 'jpg' || ext === 'jpeg') && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
        return true;
    }

    // PNG: 89 50 4E 47
    if (ext === 'png' && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        return true;
    }

    // WEBP: RIFF....WEBP
    if (
        ext === 'webp' &&
        buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    ) {
        return true;
    }

    return false;
}

export async function POST(request: NextRequest) {
    try {
        // Enforce authentication: must be an admin or an active customer
        const adminUser = await getValidAdminSession();
        const customer = adminUser ? null : await getAuthenticatedCustomer();

        if (!adminUser && !customer) {
            return NextResponse.json(
                { error: "Unauthorized: Authentication required to upload files." },
                { status: 401 }
            );
        }

        const authIdentifier = adminUser?.id || (customer ? `customer-${customer.id}` : "unknown");
        const quota = checkUploadQuota(authIdentifier);
        if (!quota.allowed) {
            return NextResponse.json(
                { error: "Upload quota exceeded. Please wait a few minutes before trying again." },
                { status: 429 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const folder = (formData.get("folder") as string) || "general";

        if (adminUser) {
            const permissionByFolder: Record<string, AdminPermission> = {
                products: "PRODUCTS_MANAGE",
                brands: "BRANDS_MANAGE",
                categories: "CATEGORIES_MANAGE",
                banners: "BANNERS_MANAGE",
                blog: "BLOG_MANAGE",
            };
            await requireAdminSession(permissionByFolder[folder] || "SITE_CONTENT_MANAGE");
        } else if (folder !== "reviews") {
            return NextResponse.json({ error: "Customers may only upload review images." }, { status: 403 });
        }

        if (!file) {
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File size exceeds the 5MB limit." },
                { status: 400 }
            );
        }

        if (!ALLOWED_MIME_TYPES.has(file.type)) {
            return NextResponse.json({ error: "Invalid image MIME type." }, { status: 400 });
        }

        const rawExt = (file.name.split('.').pop() || '').toLowerCase().trim();
        if (!ALLOWED_EXTENSIONS.has(rawExt)) {
            return NextResponse.json(
                { error: "Invalid file type. Only JPG, PNG, and WEBP images are permitted." },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Validate magic bytes
        if (!validateImageMagicBytes(buffer, rawExt)) {
            return NextResponse.json(
                { error: "File signature does not match a valid image format." },
                { status: 400 }
            );
        }

        // Decode, validate dimensions, and re-encode using sharp to eliminate polyglots/metadata vulnerabilities
        let processedBuffer: Buffer;
        let outputWidth = 0;
        let outputHeight = 0;
        const finalExt = "webp";

        try {
            const sharpInstance = sharp(buffer, { failOn: "error", limitInputPixels: MAX_INPUT_PIXELS });
            const metadata = await sharpInstance.metadata();

            if (!metadata.width || !metadata.height) {
                return NextResponse.json(
                    { error: "Unable to read image dimensions." },
                    { status: 400 }
                );
            }

            if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
                return NextResponse.json(
                    { error: `Image dimensions exceed the maximum allowed size of ${MAX_DIMENSION}x${MAX_DIMENSION}px.` },
                    { status: 400 }
                );
            }

            // Re-encode safely to WebP with sensible compression and strip all metadata
            const output = await sharpInstance
                .rotate() // Auto-orient according to EXIF before stripping
                .resize({
                    width: Math.min(metadata.width, 2560),
                    height: Math.min(metadata.height, 2560),
                    fit: "inside",
                    withoutEnlargement: true,
                })
                .webp({ quality: 85, effort: 4 })
                .toBuffer({ resolveWithObject: true });
            processedBuffer = output.data;
            outputWidth = output.info.width;
            outputHeight = output.info.height;
        } catch (sharpError) {
            console.error("Image decode/re-encode error:", sharpError);
            return NextResponse.json(
                { error: "Image processing failed. File may be corrupted or in an invalid format." },
                { status: 400 }
            );
        }

        // Sanitize folder name
        const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "") || "general";
        const baseUploadDir = getMediaStorageRoot();
        const uploadDir = join(/*turbopackIgnore: true*/ baseUploadDir, safeFolder);
        
        // Ensure directory exists
        if (!existsSync(/*turbopackIgnore: true*/ uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Create a unique filename with normalized extension
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filename = `${uniqueSuffix}.${finalExt}`;
        
        const filePath = join(uploadDir, filename);
        await writeFile(filePath, processedBuffer);
        
        // Return public URL
        const key = `${safeFolder}/${filename}`;
        const imageUrl = `/uploads/${key}`;
        
        return NextResponse.json({
            url: imageUrl,
            key,
            width: outputWidth,
            height: outputHeight,
            bytes: processedBuffer.length,
            mimeType: "image/webp",
            success: true,
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
    }
}
