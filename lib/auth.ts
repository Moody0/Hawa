import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import {
    assertAdminLoginAllowed,
    normalizeAdminUsername,
    normalizeClientIp,
    recordAdminLoginAttempt,
} from "@/lib/admin-login-throttle"
import { writeAdminAuditLog } from "@/lib/admin-audit"

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
                rememberMe: { label: "Remember me", type: "text" }
            },
            async authorize(credentials, request) {
                if (!credentials?.username || !credentials?.password) {
                    return null
                }

                const username = normalizeAdminUsername(credentials.username)
                const forwardedFor = request.headers?.["x-forwarded-for"]
                const realIp = request.headers?.["x-real-ip"]
                const ip = normalizeClientIp(Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor || (Array.isArray(realIp) ? realIp[0] : realIp))
                await assertAdminLoginAllowed(ip, username)

                if (credentials.password.length < 6 || credentials.password.length > 128) {
                    await recordAdminLoginAttempt(ip, username, false)
                    return null
                }

                const user = await prisma.user.findFirst({
                    where: { username, archivedAt: null, disabledAt: null },
                    include: { permissions: { select: { permission: true } } },
                })

                if (!user) {
                    await recordAdminLoginAttempt(ip, username, false)
                    return null
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isPasswordValid) {
                    await recordAdminLoginAttempt(ip, username, false)
                    return null
                }

                await recordAdminLoginAttempt(ip, username, true)
                await writeAdminAuditLog({
                    actorId: user.id,
                    action: "ADMIN_LOGIN_SUCCESS",
                    entityType: "User",
                    entityId: user.id,
                    metadata: { ipHashRecorded: true },
                })

                const rememberMe = credentials.rememberMe === "true"

                return {
                    id: user.id,
                    name: user.username,
                    role: user.role,
                    rememberMe,
                    permissions: user.permissions.map((item) => item.permission),
                    canManageBrands: user.canManageBrands,
                    canDeleteBrands: user.canDeleteBrands,
                    canManageProducts: user.canManageProducts,
                    canDeleteProducts: user.canDeleteProducts,
                    canManageCategories: user.canManageCategories,
                    canDeleteCategories: user.canDeleteCategories,
                    canManageBanners: user.canManageBanners,
                    canDeleteBanners: user.canDeleteBanners,
                    canManageOrders: user.canManageOrders,
                    canDeleteOrders: user.canDeleteOrders,
                    canManagePromoCodes: user.canManagePromoCodes,
                    canDeletePromoCodes: user.canDeletePromoCodes,
                    canManageReviews: user.canManageReviews,
                }
            }
        })
    ],
    pages: {
        signIn: "/admin/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.rememberMe = (user as { rememberMe?: boolean }).rememberMe;
                token.permissions = user.permissions;
                token.canManageBrands = user.canManageBrands;
                token.canDeleteBrands = user.canDeleteBrands;
                token.canManageProducts = user.canManageProducts;
                token.canDeleteProducts = user.canDeleteProducts;
                token.canManageCategories = user.canManageCategories;
                token.canDeleteCategories = user.canDeleteCategories;
                token.canManageBanners = user.canManageBanners;
                token.canDeleteBanners = user.canDeleteBanners;
                token.canManageOrders = user.canManageOrders;
                token.canDeleteOrders = user.canDeleteOrders;
                token.canManagePromoCodes = user.canManagePromoCodes;
                token.canDeletePromoCodes = user.canDeletePromoCodes;
                token.canManageReviews = user.canManageReviews;
                // Session length: 30 days if "Remember me", else 24 hours
                const maxAge = (user as { rememberMe?: boolean }).rememberMe
                    ? 30 * 24 * 60 * 60   // 30 days
                    : 24 * 60 * 60;       // 24 hours
                token.exp = Math.floor(Date.now() / 1000) + maxAge;
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as any).iat = token.iat;
                session.user.role = token.role as string;
                session.user.permissions = token.permissions || [];
                session.user.canManageBrands = token.canManageBrands as boolean;
                session.user.canDeleteBrands = token.canDeleteBrands as boolean;
                session.user.canManageProducts = token.canManageProducts as boolean;
                session.user.canDeleteProducts = token.canDeleteProducts as boolean;
                session.user.canManageCategories = token.canManageCategories as boolean;
                session.user.canDeleteCategories = token.canDeleteCategories as boolean;
                session.user.canManageBanners = token.canManageBanners as boolean;
                session.user.canDeleteBanners = token.canDeleteBanners as boolean;
                session.user.canManageOrders = token.canManageOrders as boolean;
                session.user.canDeleteOrders = token.canDeleteOrders as boolean;
                session.user.canManagePromoCodes = token.canManagePromoCodes as boolean;
                session.user.canDeletePromoCodes = token.canDeletePromoCodes as boolean;
                session.user.canManageReviews = token.canManageReviews as boolean;
            }
            return session
        }
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
}
