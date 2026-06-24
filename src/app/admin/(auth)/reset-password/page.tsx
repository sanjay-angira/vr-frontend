import { Suspense } from "react";
import { AdminAuthCard } from "@/components/admin/auth/AdminAuthCard";
import { AdminResetPasswordForm } from "@/components/admin/auth/AdminResetPasswordForm";

export default function AdminResetPasswordPage() {
  return (
    <AdminAuthCard
      title="Reset password"
      subtitle="Set a new password for your admin account"
    >
      <Suspense fallback={<p className="text-sm text-slate-500">Loading...</p>}>
        <AdminResetPasswordForm />
      </Suspense>
    </AdminAuthCard>
  );
}
