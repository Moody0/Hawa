import { createHmac } from "node:crypto";
import { prisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60_000;
const MAX_IP_FAILURES = 20;
const MAX_USERNAME_FAILURES = 8;

function throttleSecret(): string {
  const secret = process.env.ADMIN_THROTTLE_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("ADMIN_THROTTLE_SECRET or NEXTAUTH_SECRET is required");
  return secret;
}

function hashKey(scope: "ip" | "username", value: string): string {
  return createHmac("sha256", throttleSecret()).update(`${scope}:${value}`).digest("hex");
}

export function normalizeAdminUsername(value: string): string {
  return value.trim().normalize("NFKC").toLocaleLowerCase("en-US").slice(0, 128);
}

export function normalizeClientIp(value: string | null | undefined): string {
  return (value || "unknown").split(",")[0].trim().slice(0, 64) || "unknown";
}

async function failureCount(scope: "ip" | "username", value: string, since: Date): Promise<number> {
  return prisma.adminLoginAttempt.count({
    where: { keyHash: hashKey(scope, value), scope, successful: false, createdAt: { gte: since } },
  });
}

export async function assertAdminLoginAllowed(ip: string, username: string): Promise<void> {
  const since = new Date(Date.now() - WINDOW_MS);
  const [ipFailures, usernameFailures] = await Promise.all([
    failureCount("ip", normalizeClientIp(ip), since),
    failureCount("username", normalizeAdminUsername(username), since),
  ]);
  if (ipFailures >= MAX_IP_FAILURES || usernameFailures >= MAX_USERNAME_FAILURES) {
    const error = new Error("Too many login attempts. Try again later.");
    error.name = "AdminLoginThrottled";
    throw error;
  }
}

export async function recordAdminLoginAttempt(ip: string, username: string, successful: boolean): Promise<void> {
  const normalizedIp = normalizeClientIp(ip);
  const normalizedUsername = normalizeAdminUsername(username);
  await prisma.$transaction([
    prisma.adminLoginAttempt.create({ data: { keyHash: hashKey("ip", normalizedIp), scope: "ip", successful } }),
    prisma.adminLoginAttempt.create({ data: { keyHash: hashKey("username", normalizedUsername), scope: "username", successful } }),
    prisma.adminLoginAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60_000) } } }),
  ]);
}
