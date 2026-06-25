import { Suspense } from "react";
import { FooterSettingsPage } from "@/components/admin/footer-settings/FooterSettingsPage";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading...</p>}>
      <FooterSettingsPage />
    </Suspense>
  )
}
