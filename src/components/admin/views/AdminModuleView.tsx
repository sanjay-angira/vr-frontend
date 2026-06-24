"use client";

import type { AdminModuleKey } from "@/components/admin/commonTable/adminModuleTable.config";
import { getAdminViewComponent } from "./adminViewRegistry";

type AdminModuleViewProps = {
  module: AdminModuleKey;
  recordId: string;
};

export function AdminModuleView({ module, recordId }: AdminModuleViewProps) {
  const ViewComponent = getAdminViewComponent(module);

  if (!ViewComponent) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        View for <strong>{module}</strong> is not available yet.
      </div>
    );
  }

  return <ViewComponent module={module} recordId={recordId} />;
}
