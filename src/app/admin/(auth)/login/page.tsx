import { Suspense } from "react";
import { AdminAuthCard } from "@/components/admin/auth/AdminAuthCard";
import { AdminLoginForm } from "@/components/admin/auth/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <AdminAuthCard
      title="Admin sign in"
      subtitle="Enter your credentials to access the dashboard"
    >
      <Suspense fallback={<p className="text-sm text-slate-500">Loading...</p>}>
        <AdminLoginForm />
      </Suspense>
    </AdminAuthCard>
  );
}
