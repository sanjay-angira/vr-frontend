import { notFound } from "next/navigation";
import { AdminModuleForm } from "@/components/admin/forms/AdminModuleForm";
import {
  getAdminModuleTableConfig,
  type AdminModuleKey,
} from "@/components/admin/commonTable/adminModuleTable.config";
import { hasAdminForm } from "@/components/admin/forms/adminFormModules";

type AdminModuleAddPageProps = {
  params: Promise<{ module: string }>;
};

export default async function AdminModuleAddPage({
  params,
}: AdminModuleAddPageProps) {
  const { module } = await params;
  const config = getAdminModuleTableConfig(module);

  if (!config || !hasAdminForm(module)) {
    notFound();
  }

  return <AdminModuleForm module={module as AdminModuleKey} />;
}
