import { requireAdminSession } from "@/lib/admin-auth";

export default async function AdminCustomersLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession("CUSTOMERS_VIEW");
  return children;
}

