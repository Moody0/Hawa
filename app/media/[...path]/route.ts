import { getMediaStorageRoot, normalizeMediaKey, resolveMediaPath } from "@/lib/media-storage";
import { immutableMediaResponse } from "@/lib/media-response";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  try {
    const key = normalizeMediaKey((await context.params).path);
    return await immutableMediaResponse(resolveMediaPath(getMediaStorageRoot(), key), request);
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

