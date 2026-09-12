import { NextResponse } from "next/server";
import path from "node:path";
import { existsSync } from "node:fs";
import { getMediaStorageRoot, normalizeMediaKey, resolveMediaPath } from "@/lib/media-storage";
import { immutableMediaResponse } from "@/lib/media-response";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  try {
    const key = normalizeMediaKey((await context.params).path);

    // 1. Try serving from configured storage root if file exists
    try {
      const root = getMediaStorageRoot();
      const filePath = resolveMediaPath(root, key);
      if (existsSync(filePath)) {
        return await immutableMediaResponse(filePath, request);
      }
    } catch {
      // Fall through to public uploads
    }

    // 2. Try serving from local public/uploads directory
    try {
      const publicUploads = path.resolve(process.cwd(), "public", "uploads");
      const fallbackPath = resolveMediaPath(publicUploads, key);
      if (existsSync(fallbackPath)) {
        return await immutableMediaResponse(fallbackPath, request);
      }
    } catch {
      // Fall through to CDN redirect
    }

    // 3. In Vercel serverless production, files are hosted on Vercel Edge CDN under /uploads/
    return NextResponse.redirect(new URL(`/uploads/${key}`, request.url), 307);
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

