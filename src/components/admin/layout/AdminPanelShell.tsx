"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { AdminMobileSidebar } from "@/components/admin/layout/AdminMobileSidebar";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { useAdminAuth } from "@/services/admin/useAdminAuth";

type AdminPanelShellProps = {
  children: React.ReactNode;
};

export function AdminPanelShell({ children }: AdminPanelShellProps) {
  useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="admin-panel flex min-h-screen bg-slate-50">
      <div className="hidden lg:block">
        <AdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((value) => !value)}
          className="fixed left-0 top-0 z-30 h-screen"
        />
      </div>

      <AdminMobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div
        className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ${
          collapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <AdminHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}


