"use client";

import type { ReactNode } from "react";
import { AccountShell } from "@/components/website/account/AccountShell";

export default function AccountPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AccountShell>{children}</AccountShell>;
}
