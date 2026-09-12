import path from "node:path";

export function getMediaStorageRoot(): string {
  const configured = process.env.MEDIA_STORAGE_DIR;
  if (configured) {
    if (!path.isAbsolute(configured)) throw new Error("MEDIA_STORAGE_DIR must be absolute");
    return path.resolve(configured);
  }
  return path.resolve(process.cwd(), "public", "uploads");
}

export function normalizeMediaKey(parts: string[]): string {
  const decoded = parts.map((part) => decodeURIComponent(part));
  if (!decoded.length || decoded.some((part) => !part || part === "." || part === ".." || /[\\/\0]/.test(part))) {
    throw new Error("Invalid media key");
  }
  return decoded.join("/");
}

export function resolveMediaPath(root: string, key: string): string {
  const resolved = path.resolve(root, ...key.split("/"));
  const relative = path.relative(root, resolved);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Invalid media path");
  return resolved;
}

export const SAFE_MEDIA_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

