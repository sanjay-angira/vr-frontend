"use client";

import { WebsiteFooter } from "@/components/website/layout/WebsiteFooter";
import { WebsiteProgressBar } from "@/components/website/shared/WebsiteProgressBar";
import AuthModals from "@/components/website/authComponents/AuthModals";
import { WebsiteHeaderSection } from "@/components/website/header/WebsiteHeaderSection";
import type { WebsiteHeaderData } from "@/types/header";

type WebsiteShellProps = {
  children: React.ReactNode;
  headerData: WebsiteHeaderData;
};

export function WebsiteShell({ children, headerData }: WebsiteShellProps) {
  return (
    <div className="website-layout">
      <WebsiteProgressBar />
      <WebsiteHeaderSection data={headerData} />
      <AuthModals />
      <main className="flex-1">{children}</main>
      <WebsiteFooter />
    </div>
  );
}
