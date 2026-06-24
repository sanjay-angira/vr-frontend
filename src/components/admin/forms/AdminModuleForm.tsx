"use client";

import type { AdminModuleKey } from "@/components/admin/commonTable/adminModuleTable.config";
import { getAdminFormComponent } from "./adminFormRegistry";

type AdminModuleFormProps = {
  module: AdminModuleKey;
  recordId?: string;
};

export function AdminModuleForm({ module, recordId }: AdminModuleFormProps) {
  const FormComponent = getAdminFormComponent(module);

  if (!FormComponent) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        Form for <strong>{module}</strong> is not available yet.
      </div>
    );
  }

  return <FormComponent module={module} recordId={recordId} />;
}
