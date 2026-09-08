import { requireAdminSession } from "@/lib/admin-auth";

export default async function AdminBlogLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession("BLOG_VIEW");
  return children;
}

