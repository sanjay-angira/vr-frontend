"use client";

import type { AdminModuleKey } from "@/components/admin/commonTable/adminModuleTable.config";
import { AdminRecordView } from "./AdminRecordView";
import { getAdminViewComponent } from "./adminViewRegistry";

type AdminModuleViewProps = {
  module: AdminModuleKey;
  recordId: string;
};

export function AdminModuleView({ module, recordId }: AdminModuleViewProps) {
  const ViewComponent = getAdminViewComponent(module);

  if (ViewComponent) {
    return <ViewComponent module={module} recordId={recordId} />;
  }

  return <AdminRecordView module={module} recordId={recordId} />;
}
