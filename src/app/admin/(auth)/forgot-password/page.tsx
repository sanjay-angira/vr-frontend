import { AdminAuthCard } from "@/components/admin/auth/AdminAuthCard";
import { AdminForgotPasswordForm } from "@/components/admin/auth/AdminForgotPasswordForm";
import { Suspense } from "react";

export default function AdminForgotPasswordPage() {
  return (
    <AdminAuthCard
      title="Forgot password?"
      subtitle="We'll send reset instructions to your admin email"
    >
      <Suspense fallback={<p className="text-sm text-slate-500">Loading...</p>}>
        <AdminForgotPasswordForm />
      </Suspense>
    </AdminAuthCard>
  );
}
