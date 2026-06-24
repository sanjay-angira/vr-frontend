import { notFound } from "next/navigation";
import { AdminModuleForm } from "@/components/admin/forms/AdminModuleForm";
import {
  getAdminModuleTableConfig,
  type AdminModuleKey,
} from "@/components/admin/commonTable/adminModuleTable.config";
import { hasAdminForm } from "@/components/admin/forms/adminFormModules";

type AdminModuleEditPageProps = {
  params: Promise<{ module: string; id: string }>;
};

export default async function AdminModuleEditPage({
  params,
}: AdminModuleEditPageProps) {
  const { module, id } = await params;
  const config = getAdminModuleTableConfig(module);

  if (!config || !hasAdminForm(module)) {
    notFound();
  }
  return (
    <AdminModuleForm module={module as AdminModuleKey} recordId={id} />
  );
}
