import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAuthenticatedCustomer } from "@/lib/customer-auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

function validateImageMagicBytes(buffer: Buffer, ext: string): boolean {
    if (buffer.length < 12) return false;

    // JPEG: FF D8 FF
    if ((ext === 'jpg' || ext === 'jpeg') && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
        return true;
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (ext === 'png' && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        return true;
    }

    // WEBP: RIFF....WEBP (52 49 46 46 .... 57 45 42 50)
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
        const [adminSession, customer] = await Promise.all([
            getServerSession(authOptions),
            getAuthenticatedCustomer(),
        ]);

        if (!adminSession && !customer) {
            return NextResponse.json(
                { error: "Unauthorized: Authentication required to upload files." },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const folder = (formData.get("folder") as string) || "general";

        if (!file) {
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File size exceeds the 5MB limit." },
                { status: 400 }
            );
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

        // Validate magic bytes to prevent renamed malicious payloads
        if (!validateImageMagicBytes(buffer, rawExt)) {
            return NextResponse.json(
                { error: "File signature does not match a valid image format." },
                { status: 400 }
            );
        }

        // Sanitize folder name
        const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "") || "general";
        const uploadDir = join(process.cwd(), `public/uploads/${safeFolder}`);
        
        // Ensure directory exists
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Create a unique filename with normalized extension
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const cleanExt = rawExt === 'jpeg' ? 'jpg' : rawExt;
        const filename = `${uniqueSuffix}.${cleanExt}`;
        
        const filePath = join(uploadDir, filename);
        await writeFile(filePath, buffer);
        
        // Return the public URL
        const imageUrl = `/uploads/${safeFolder}/${filename}`;
        
        return NextResponse.json({ url: imageUrl, success: true });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
    }
}
