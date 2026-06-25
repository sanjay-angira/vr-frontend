import { WebsiteFooter } from "@/components/website/layout/WebsiteFooter";
import { WebsiteProgressBar } from "@/components/website/shared/WebsiteProgressBar";
import AuthModals from "@/components/website/auth/AuthModals";
import { WebsiteHeader } from "@/components/website/header/WebsiteHeaderSection";

type WebsiteShellProps = {
  children: React.ReactNode;
};

export function WebsiteShell({ children }: WebsiteShellProps) {
  return (
    <div className="website-layout">
      <WebsiteProgressBar />
      <AuthModals />
      <WebsiteHeader/>
      <main className="flex-1">{children}</main>
      <WebsiteFooter />
    </div>
  );
}
