"use client";

import { usePathname } from "next/navigation";
import { AccountChromeSkeleton } from "@/components/website/account/AccountSkeletons";
import { getAccountMeta } from "@/components/website/account/accountMeta";

/** Route-aware account loading UI for (panel)/loading.tsx */
export function AccountRouteLoading() {
  const pathname = usePathname();
  const { skeleton } = getAccountMeta(pathname);

  return <AccountChromeSkeleton>{skeleton}</AccountChromeSkeleton>;
}
