"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { adminMenuSections } from "@/components/admin/commonTable/adminMenu";
import { getAdminModuleTableConfig } from "@/components/admin/commonTable/adminModuleTable.config";
import { tokenStorage } from "@/services/api/storage";
import { useAppDispatch, useAppSelector } from "@/services/redux/hooks";
import { selectAdminAuth } from "@/services/redux/selectors";
import { clearAdminAuth } from "@/services/redux/slices/adminSlices/adminAuthSlice";

type AdminHeaderProps = {
  onMenuClick: () => void;
};

function getPageTitle(pathname: string) {
  if (pathname === "/admin/profile") return "Profile";
  if (pathname === "/admin/settings") return "Settings";
  if (pathname === "/admin/dashboard") return "Dashboard";

  const moduleMatch = pathname.match(/^\/admin\/([^/]+)/);
  if (moduleMatch) {
    const config = getAdminModuleTableConfig(moduleMatch[1]);
    if (config) {
      return config.label;
    }
  }

  for (const section of adminMenuSections) {
    for (const item of section.items) {
      if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
        return item.label;
      }
    }
  }

  return "Admin";
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { admin } = useAppSelector(selectAdminAuth);
  const [menuOpen, setMenuOpen] = useState(false);
  const pageTitle = getPageTitle(pathname);
  const adminInitial =
    admin?.name
      ?.trim()
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A";

  function handleLogout() {
    setMenuOpen(false);
    tokenStorage.clearAdmin();
    dispatch(clearAdminAuth());
    window.location.href = "/admin/login";
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden"
          aria-label="Open menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div>
          <h1 className="text-lg font-semibold text-zinc-900">{pageTitle}</h1>
          <p className="hidden text-xs text-zinc-500 sm:block">
            Manage your store from one place
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          type="button"
          className="relative rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
          aria-label="Notifications"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-zinc-100"
          >
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-admin-primary text-sm font-semibold text-white">
              {admin?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={admin.avatar}
                  alt={admin.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                adminInitial
              )}
            </span>
            <span className="hidden text-sm font-medium text-zinc-700 md:block">
              {admin?.name ?? "Admin"}
            </span>
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10"
                aria-label="Close profile menu"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                <Link
                  href={"/admin/profile"}
                  className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href={"/admin/settings"}
                  className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Settings
                </Link>
                <hr className="my-1 border-zinc-100" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
