export const ADMIN_PERMISSIONS = [
  "PRODUCTS_VIEW", "PRODUCTS_MANAGE", "PRODUCTS_ARCHIVE", "PRODUCTS_IMPORT",
  "BRANDS_VIEW", "BRANDS_MANAGE", "BRANDS_ARCHIVE",
  "CATEGORIES_VIEW", "CATEGORIES_MANAGE", "CATEGORIES_ARCHIVE",
  "MAIN_CATEGORIES_VIEW", "MAIN_CATEGORIES_MANAGE", "MAIN_CATEGORIES_ARCHIVE",
  "BANNERS_VIEW", "BANNERS_MANAGE", "BANNERS_ARCHIVE",
  "ORDERS_VIEW", "ORDERS_MANAGE", "ORDERS_ARCHIVE",
  "CUSTOMERS_VIEW", "CUSTOMERS_MANAGE", "CUSTOMERS_ARCHIVE",
  "REVIEWS_VIEW", "REVIEWS_MANAGE", "REVIEWS_ARCHIVE",
  "BLOG_VIEW", "BLOG_MANAGE", "BLOG_ARCHIVE",
  "SITE_CONTENT_VIEW", "SITE_CONTENT_MANAGE", "SITE_CONTENT_ARCHIVE",
  "AUDIT_LOG_VIEW",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export type LegacyAdminPermission =
  | "canManageBrands" | "canDeleteBrands"
  | "canManageProducts" | "canDeleteProducts"
  | "canManageCategories" | "canDeleteCategories"
  | "canManageBanners" | "canDeleteBanners"
  | "canManageOrders" | "canDeleteOrders"
  | "canManagePromoCodes" | "canDeletePromoCodes"
  | "canManageReviews";

export const LEGACY_PERMISSION_MAP: Record<LegacyAdminPermission, AdminPermission> = {
  canManageBrands: "BRANDS_MANAGE",
  canDeleteBrands: "BRANDS_ARCHIVE",
  canManageProducts: "PRODUCTS_MANAGE",
  canDeleteProducts: "PRODUCTS_ARCHIVE",
  canManageCategories: "CATEGORIES_MANAGE",
  canDeleteCategories: "CATEGORIES_ARCHIVE",
  canManageBanners: "BANNERS_MANAGE",
  canDeleteBanners: "BANNERS_ARCHIVE",
  canManageOrders: "ORDERS_MANAGE",
  canDeleteOrders: "ORDERS_ARCHIVE",
  canManagePromoCodes: "SITE_CONTENT_MANAGE",
  canDeletePromoCodes: "SITE_CONTENT_ARCHIVE",
  canManageReviews: "REVIEWS_MANAGE",
};

export function normalizeAdminPermission(permission: AdminPermission | LegacyAdminPermission): AdminPermission {
  return permission in LEGACY_PERMISSION_MAP
    ? LEGACY_PERMISSION_MAP[permission as LegacyAdminPermission]
    : permission as AdminPermission;
}

export function permissionImplies(granted: ReadonlySet<AdminPermission>, required: AdminPermission): boolean {
  if (granted.has(required)) return true;
  if (required.endsWith("_VIEW")) {
    const resource = required.slice(0, -5);
    return granted.has(`${resource}_MANAGE` as AdminPermission) || granted.has(`${resource}_ARCHIVE` as AdminPermission);
  }
  return false;
}

