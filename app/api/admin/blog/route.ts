import { NextResponse } from "next/server";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, type AdminUserSession } from "@/lib/admin-auth";
import { adminApiError, validationError } from "@/lib/admin-api";
import { archiveReasonSchema, blogPostMutationSchema, identifierSchema, zodFieldErrors } from "@/lib/admin-validation";
import { writeAdminAuditLog } from "@/lib/admin-audit";

function actorId(session: Awaited<ReturnType<typeof requireAdminSession>>): string {
  return (session.user as AdminUserSession).id;
}

export async function GET(request: Request) {
  try {
    await requireAdminSession("BLOG_VIEW");
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 25, 1), 100);
    const search = url.searchParams.get("search")?.trim().slice(0, 200);
    const includeArchived = url.searchParams.get("archived") === "true";
    const where = {
      archivedAt: includeArchived ? { not: null } : null,
      ...(search ? { OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { titleAr: { contains: search, mode: "insensitive" as const } },
        { category: { contains: search, mode: "insensitive" as const } },
      ] } : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.post.findMany({
        where,
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      }),
      prisma.post.count({ where }),
    ]);
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit);
    const nextCursor = hasMore ? items.at(-1)?.id ?? null : null;
    return NextResponse.json({ items, total, nextCursor, previousCursor: cursor ? items[0]?.id ?? null : null, posts: items });
  } catch (error) {
    return adminApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminSession("BLOG_MANAGE");
    const parsed = blogPostMutationSchema.safeParse(await request.json());
    if (!parsed.success) return validationError(zodFieldErrors(parsed.error));
    const data = parsed.data;
    const baseSlug = slugify(data.title, { lower: true, strict: true }) || `post-${Date.now()}`;
    let slug = baseSlug;
    for (let counter = 1; await prisma.post.findUnique({ where: { slug } }); counter += 1) slug = `${baseSlug}-${counter}`;
    const post = await prisma.post.create({ data: {
      title: data.title,
      titleAr: data.titleAr || data.title,
      slug,
      category: data.category || "Company news",
      categoryAr: data.categoryAr || data.category || "Company news",
      excerpt: data.excerpt || null,
      excerptAr: data.excerptAr || null,
      content: data.content,
      contentAr: data.contentAr || null,
      image: data.image || null,
      isPublished: data.isPublished ?? true,
    } });
    const audit = await writeAdminAuditLog({ actorId: actorId(session), action: "CREATE", entityType: "Post", entityId: post.id });
    return NextResponse.json({ ok: true, data: post, post, auditId: audit.id }, { status: 201 });
  } catch (error) {
    return adminApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAdminSession("BLOG_MANAGE");
    const parsed = blogPostMutationSchema.required({ id: true }).safeParse(await request.json());
    if (!parsed.success) return validationError(zodFieldErrors(parsed.error));
    const { id, ...data } = parsed.data;
    const post = await prisma.post.update({ where: { id, archivedAt: null }, data: {
      ...data,
      titleAr: data.titleAr || data.title,
      image: data.image || null,
    } });
    const audit = await writeAdminAuditLog({ actorId: actorId(session), action: "UPDATE", entityType: "Post", entityId: id });
    return NextResponse.json({ ok: true, data: post, post, auditId: audit.id });
  } catch (error) {
    return adminApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAdminSession("BLOG_ARCHIVE");
    const body = await request.json();
    const id = identifierSchema.safeParse(body.id);
    if (!id.success || body.restore !== true) return validationError({ id: ["A valid ID and restore=true are required"] });
    const post = await prisma.post.update({ where: { id: id.data }, data: { archivedAt: null } });
    const audit = await writeAdminAuditLog({ actorId: actorId(session), action: "RESTORE", entityType: "Post", entityId: id.data });
    return NextResponse.json({ ok: true, data: post, auditId: audit.id });
  } catch (error) {
    return adminApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireAdminSession("BLOG_ARCHIVE");
    const url = new URL(request.url);
    const id = identifierSchema.safeParse(url.searchParams.get("id"));
    const reason = archiveReasonSchema.safeParse(url.searchParams.get("reason") || "Archived by administrator");
    if (!id.success || !reason.success) return validationError({ _form: ["A valid ID and archive reason are required"] });
    const post = await prisma.post.update({ where: { id: id.data }, data: { archivedAt: new Date(), isPublished: false } });
    const audit = await writeAdminAuditLog({ actorId: actorId(session), action: "ARCHIVE", entityType: "Post", entityId: id.data, metadata: { reason: reason.data } });
    return NextResponse.json({ ok: true, data: post, auditId: audit.id });
  } catch (error) {
    return adminApiError(error);
  }
}
