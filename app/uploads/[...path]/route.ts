import path from "node:path";
import { getMediaStorageRoot, normalizeMediaKey, resolveMediaPath } from "@/lib/media-storage";
import { immutableMediaResponse } from "@/lib/media-response";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  try {
    const key = normalizeMediaKey((await context.params).path);
    try {
      const persistentPath = resolveMediaPath(getMediaStorageRoot(), key);
      return await immutableMediaResponse(persistentPath, request);
    } catch {
      const legacyRoot = path.resolve(process.cwd(), "public", "uploads");
      return await immutableMediaResponse(resolveMediaPath(legacyRoot, key), request);
    }
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
