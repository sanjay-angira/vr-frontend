import { AdminPanelShell } from "@/components/admin/layout/AdminPanelShell";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminPanelShell>{children}</AdminPanelShell>;
}
