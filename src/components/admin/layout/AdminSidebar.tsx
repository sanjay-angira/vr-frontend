"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminMenuSections } from "@/components/admin/commonTable/adminMenu";
import { AdminNavIcon } from "@/components/admin/layout/AdminNavIcon";

type AdminSidebarProps = {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
  className?: string;
};

export function AdminSidebar({
  collapsed = false,
  onToggle,
  onNavigate,
  className = "",
}: AdminSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  return (
    <aside
      className={`flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-admin-sidebar-hover bg-admin-sidebar transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      } ${className}`}
    >
      <div
        className={`flex shrink-0 border-b border-admin-sidebar-hover ${
          collapsed
            ? "flex-col items-center gap-2 py-3"
            : "h-16 items-center justify-between px-4"
        }`}
      >
        <Link
          href="/admin/dashboard"
          className={`min-w-0 ${collapsed ? "flex h-10 w-10 items-center justify-center rounded-lg bg-admin-primary" : "flex-1"}`}
          onClick={onNavigate}
          title="Admin Panel"
        >
          {collapsed ? (
            <span className="text-sm font-bold text-white">
              
            </span>
          ) : (
            <>
              <p className="truncate text-sm font-bold text-white">
                Admin Panel
              </p>
              <p className="text-xs text-blue-200/70">Admin Panel</p>
            </>
          )}
        </Link>

        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex shrink-0 items-center justify-center rounded-lg p-2 text-blue-200/80 transition-colors hover:bg-admin-sidebar-hover hover:text-white"
          >
            <svg
              className={`h-5 w-5 transition-transform duration-300 ${
                collapsed ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        )}
      </div>

      <nav
        className={`scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 ${collapsed ? "px-2" : "px-3"}`}
      >
        {adminMenuSections.map((section) => (
          <div key={section.title} className="mb-6 last:mb-0">
            {!collapsed && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-blue-200/60">
                {section.title}
              </p>
            )}

            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center rounded-lg text-sm font-medium transition-colors ${
                        collapsed
                          ? "justify-center p-2.5"
                          : "gap-3 px-3 py-2.5"
                      } ${
                        active
                          ? "bg-admin-primary text-white shadow-sm"
                          : "text-blue-100/80 hover:bg-admin-sidebar-hover hover:text-white"
                      }`}
                    >
                      <AdminNavIcon name={item.icon} className="h-5 w-5 shrink-0" />
                      {!collapsed && item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={`shrink-0 border-t border-admin-sidebar-hover ${collapsed ? "p-2" : "p-4"}`}>
        {!collapsed && (
          <div className="rounded-lg bg-admin-sidebar-hover px-3 py-3">
            <p className="text-xs font-medium text-blue-50">Need help?</p>
            <p className="mt-1 text-xs text-blue-200/70">
              Check docs or contact support.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
