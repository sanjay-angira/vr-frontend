import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AccountShell } from "@/components/website/account/AccountShell";
import { NOINDEX_ROBOTS, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "My Account | Vrindavan Rasa",
  description: "Manage your Vrindavan Rasa account, orders, addresses, and wishlist.",
  path: "/profile",
  robots: NOINDEX_ROBOTS,
});

export default function AccountPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AccountShell>{children}</AccountShell>;
}
