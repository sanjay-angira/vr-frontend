import "@/styles/website/index.css";
import { WebsiteShell } from "@/components/website/WebsiteShell";

export default function WebsiteLayout({children,}: {children: React.ReactNode}) {
  return <WebsiteShell>{children}</WebsiteShell>;
}
