import { Suspense } from "react";
import { HeaderSettingsPage } from "@/components/admin/header-settings/HeaderSettingsPage";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading...</p>}>
      <HeaderSettingsPage />
    </Suspense>
  );
}
