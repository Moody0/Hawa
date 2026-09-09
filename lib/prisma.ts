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

    if (rawDatabaseUrl) {
        try {
            const databaseUrl = new URL(rawDatabaseUrl);

            // In regions/ISPs where AWS eu-central-1 3.x.x.x IPs are blackholed/filtered,
            // aws-0-eu-central-1.pooler.supabase.com round-robins to dead 3.x IPs.
            // Using a known healthy pooler IP ensures instant and stable connections.
            if (process.env.SUPABASE_POOLER_IP) {
                databaseUrl.hostname = process.env.SUPABASE_POOLER_IP;
            } else if (databaseUrl.hostname === "aws-0-eu-central-1.pooler.supabase.com") {
                databaseUrl.hostname = "18.198.145.223";
            }

            if (databaseUrl.searchParams.has("pgbouncer") || databaseUrl.hostname.includes("pooler") || databaseUrl.hostname === "18.198.145.223") {
                if (!databaseUrl.searchParams.has("connection_limit")) {
                    databaseUrl.searchParams.set("connection_limit", "10");
                }
                if (!databaseUrl.searchParams.has("pool_timeout")) {
                    databaseUrl.searchParams.set("pool_timeout", "15");
                }
                if (!databaseUrl.searchParams.has("connect_timeout")) {
                    databaseUrl.searchParams.set("connect_timeout", "15");
                }
            }

            return new PrismaClient({ datasources: { db: { url: databaseUrl.toString() } } });
        } catch {
            // Let Prisma report the original configuration error below.
        }
    }

    return new PrismaClient();
}
