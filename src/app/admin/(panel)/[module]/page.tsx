import { notFound } from "next/navigation";
import { AdminModuleTable } from "@/components/admin/commonTable/AdminModuleTable";
import {
  getAdminModuleTableConfig,
  type AdminModuleKey,
} from "@/components/admin/commonTable/adminModuleTable.config";

type AdminModulePageProps = {
  params: Promise<{ module: string }>;
};

export default async function AdminModulePage({ params }: AdminModulePageProps) {
  const { module } = await params;
  const config = getAdminModuleTableConfig(module);

  if (!config) {
    notFound();
  }

  return <AdminModuleTable module={module as AdminModuleKey} />;
}
