"use client";

import { AnnouncementBar } from "@/components/website/layout/AnnouncementBar";
import { WebsiteHeader } from "@/components/website/layout/WebsiteHeader";
import { WebsiteFooter } from "@/components/website/layout/WebsiteFooter";
import { WebsiteProgressBar } from "@/components/website/shared/WebsiteProgressBar";
import AuthModals from "@/components/website/authComponents/AuthModals";

export function WebsiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="website-layout">
      <WebsiteProgressBar />
      <AnnouncementBar />
      <WebsiteHeader />
      <AuthModals />
      <main className="flex-1">{children}</main>
      <WebsiteFooter />
    </div>
  );
}
