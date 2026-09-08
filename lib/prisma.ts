import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ?? createPrismaClient();

if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma;
}

function createPrismaClient() {
    const rawDatabaseUrl = process.env.DATABASE_URL;

    // Supabase's transaction pooler is shared by many serverless instances.
    // Prisma's default pool (up to 13 connections per instance) can exhaust
    // the pooler and surface as intermittent P1001/P2024 errors. Keep one
    // connection per runtime and let Prisma wait briefly for a free slot.
    if (rawDatabaseUrl?.includes("pooler.supabase.com")) {
        try {
            const databaseUrl = new URL(rawDatabaseUrl);
            if (!databaseUrl.searchParams.has("connection_limit")) {
                databaseUrl.searchParams.set("connection_limit", "10");
            }
            if (!databaseUrl.searchParams.has("pool_timeout")) {
                databaseUrl.searchParams.set("pool_timeout", "30");
            }
            if (!databaseUrl.searchParams.has("connect_timeout")) {
                databaseUrl.searchParams.set("connect_timeout", "30");
            }

            return new PrismaClient({ datasources: { db: { url: databaseUrl.toString() } } });
        } catch {
            // Let Prisma report the original configuration error below.
        }
    }

    return new PrismaClient();
}
