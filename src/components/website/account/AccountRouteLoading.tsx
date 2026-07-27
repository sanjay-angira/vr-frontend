"use client";

import { usePathname } from "next/navigation";
import { getAccountMeta } from "@/components/website/account/accountMeta";

/**
 * Content-only skeleton for (account)/loading.tsx.
 * Layout already provides AccountShell chrome — do not nest another full page.
 */
export function AccountRouteLoading() {
  const pathname = usePathname();
  const { skeleton } = getAccountMeta(pathname);
  return <>{skeleton}</>;
}
