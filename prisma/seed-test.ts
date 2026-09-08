import { PrismaClient, type AdminPermission } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const roles: Array<{ username: string; role: "SUPER_ADMIN" | "ADMIN"; permissions: AdminPermission[] }> = [
  { username: "test-super-admin", role: "SUPER_ADMIN", permissions: [
    "PRODUCTS_VIEW", "PRODUCTS_MANAGE", "PRODUCTS_ARCHIVE", "PRODUCTS_IMPORT", "BRANDS_VIEW", "BRANDS_MANAGE", "BRANDS_ARCHIVE",
    "CATEGORIES_VIEW", "CATEGORIES_MANAGE", "CATEGORIES_ARCHIVE", "MAIN_CATEGORIES_VIEW", "MAIN_CATEGORIES_MANAGE", "MAIN_CATEGORIES_ARCHIVE",
    "BANNERS_VIEW", "BANNERS_MANAGE", "BANNERS_ARCHIVE", "ORDERS_VIEW", "ORDERS_MANAGE", "ORDERS_ARCHIVE", "CUSTOMERS_VIEW",
    "CUSTOMERS_MANAGE", "CUSTOMERS_ARCHIVE", "REVIEWS_VIEW", "REVIEWS_MANAGE", "REVIEWS_ARCHIVE", "BLOG_VIEW", "BLOG_MANAGE",
    "BLOG_ARCHIVE", "SITE_CONTENT_VIEW", "SITE_CONTENT_MANAGE", "SITE_CONTENT_ARCHIVE", "AUDIT_LOG_VIEW",
  ] },
  { username: "test-catalog-admin", role: "ADMIN", permissions: [
    "PRODUCTS_VIEW", "PRODUCTS_MANAGE", "PRODUCTS_ARCHIVE", "PRODUCTS_IMPORT", "BRANDS_VIEW", "BRANDS_MANAGE", "BRANDS_ARCHIVE",
    "CATEGORIES_VIEW", "CATEGORIES_MANAGE", "CATEGORIES_ARCHIVE", "MAIN_CATEGORIES_VIEW", "MAIN_CATEGORIES_MANAGE", "MAIN_CATEGORIES_ARCHIVE",
  ] },
  { username: "test-sales-admin", role: "ADMIN", permissions: [
    "ORDERS_VIEW", "ORDERS_MANAGE", "ORDERS_ARCHIVE", "CUSTOMERS_VIEW", "CUSTOMERS_MANAGE", "CUSTOMERS_ARCHIVE", "REVIEWS_VIEW", "REVIEWS_MANAGE", "REVIEWS_ARCHIVE",
  ] },
  { username: "test-content-admin", role: "ADMIN", permissions: [
    "BANNERS_VIEW", "BANNERS_MANAGE", "BANNERS_ARCHIVE", "BLOG_VIEW", "BLOG_MANAGE", "BLOG_ARCHIVE", "SITE_CONTENT_VIEW", "SITE_CONTENT_MANAGE", "SITE_CONTENT_ARCHIVE",
  ] },
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL || "";
  const password = process.env.TEST_ADMIN_PASSWORD;
  if (process.env.NODE_ENV !== "test" || !/(?:test|ci)/i.test(databaseUrl)) {
    throw new Error("Refusing to load fixtures outside an isolated test database");
  }
  if (!password || password.length < 12 || password.length > 128) {
    throw new Error("TEST_ADMIN_PASSWORD must contain 12 to 128 characters");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  for (const identity of roles) {
    await prisma.user.upsert({
      where: { username: identity.username },
      update: {
        password: passwordHash,
        role: identity.role,
        archivedAt: null,
        disabledAt: null,
        permissions: { deleteMany: {}, create: identity.permissions.map((permission) => ({ permission })) },
      },
      create: {
        username: identity.username,
        password: passwordHash,
        role: identity.role,
        permissions: { create: identity.permissions.map((permission) => ({ permission })) },
      },
    });
  }
  const mainCategory = await prisma.mainCategory.upsert({
    where: { slug: "test-fixtures" },
    update: { archivedAt: null, isActive: true },
    create: { name: "Test Fixtures", slug: "test-fixtures" },
  });
  const brand = await prisma.brand.upsert({
    where: { slug: "test-fixture-brand" },
    update: { archivedAt: null, isActive: true },
    create: { name: "Test Fixture Brand", slug: "test-fixture-brand", mainCategoryId: mainCategory.id },
  });
  await prisma.category.upsert({
    where: { slug: "test-fixture-category" },
    update: { archivedAt: null, brandId: brand.id, mainCategoryId: mainCategory.id },
    create: { name: "Test Fixture Category", slug: "test-fixture-category", brandId: brand.id, mainCategoryId: mainCategory.id },
  });
  console.log(`Loaded ${roles.length} isolated administrator identities and deterministic catalog fixtures.`);
}

main().finally(() => prisma.$disconnect());

