import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { SAFE_MEDIA_TYPES } from "@/lib/media-storage";

export async function immutableMediaResponse(filePath: string, request: Request): Promise<Response> {
  const mimeType = SAFE_MEDIA_TYPES[path.extname(filePath).toLowerCase()];
  if (!mimeType) return new Response("Unsupported media type", { status: 415 });
  const info = await stat(filePath);
  if (!info.isFile()) return new Response("Not found", { status: 404 });
  const etag = `"${info.size.toString(16)}-${Math.trunc(info.mtimeMs).toString(16)}"`;
  const headers = new Headers({
    "Content-Type": mimeType,
    "Content-Length": String(info.size),
    "Cache-Control": "public, max-age=31536000, immutable",
    "ETag": etag,
    "X-Content-Type-Options": "nosniff",
  });
  if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });
  const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
  return new Response(stream, { status: 200, headers });
}

