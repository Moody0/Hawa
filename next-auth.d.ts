import { DefaultSession } from "next-auth"
import type { AdminPermission } from "@/lib/admin-permissions"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            iat?: number
            permissions: AdminPermission[]
            canManageBrands: boolean
            canDeleteBrands: boolean
            canManageProducts: boolean
            canDeleteProducts: boolean
            canManageCategories: boolean
            canDeleteCategories: boolean
            canManageBanners: boolean
            canDeleteBanners: boolean
            canManageOrders: boolean
            canDeleteOrders: boolean
            canManagePromoCodes: boolean
            canDeletePromoCodes: boolean
            canManageReviews: boolean
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        role: string
        permissions: AdminPermission[]
        canManageBrands: boolean
        canDeleteBrands: boolean
        canManageProducts: boolean
        canDeleteProducts: boolean
        canManageCategories: boolean
        canDeleteCategories: boolean
        canManageBanners: boolean
        canDeleteBanners: boolean
        canManageOrders: boolean
        canDeleteOrders: boolean
        canManagePromoCodes: boolean
        canDeletePromoCodes: boolean
        canManageReviews: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: string
        permissions: AdminPermission[]
        canManageBrands: boolean
        canDeleteBrands: boolean
        canManageProducts: boolean
        canDeleteProducts: boolean
        canManageCategories: boolean
        canDeleteCategories: boolean
        canManageBanners: boolean
        canDeleteBanners: boolean
        canManageOrders: boolean
        canDeleteOrders: boolean
        canManagePromoCodes: boolean
        canDeletePromoCodes: boolean
        canManageReviews: boolean
    }
}
