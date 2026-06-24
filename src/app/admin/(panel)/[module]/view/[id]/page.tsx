import { notFound } from "next/navigation";
import { AdminModuleView } from "@/components/admin/views/AdminModuleView";
import {
  getAdminModuleTableConfig,
  type AdminModuleKey,
} from "@/components/admin/commonTable/adminModuleTable.config";
import { hasAdminView } from "@/components/admin/views/adminViewModules";

type AdminModuleViewPageProps = {
  params: Promise<{ module: string; id: string }>;
};

export default async function AdminModuleViewPage({
  params,
}: AdminModuleViewPageProps) {
  const { module, id } = await params;
  const config = getAdminModuleTableConfig(module);

  if (!config || !hasAdminView(module)) {
    notFound();
  }

  return (
    <AdminModuleView module={module as AdminModuleKey} recordId={id} />
  );
}
