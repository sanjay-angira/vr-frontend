"use client";

import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";

type AdminMobileSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function AdminMobileSidebar({
  open,
  onClose,
}: AdminMobileSidebarProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div className="relative h-full w-64 shadow-xl">
        <AdminSidebar onNavigate={onClose} className="h-full" />
      </div>
    </div>
  );
}
