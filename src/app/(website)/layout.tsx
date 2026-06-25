import "@/styles/website/index.css";
import { WebsiteShell } from "@/components/website/WebsiteShell";
import { fetchWebsiteHeader } from "@/services/website/headerService";

export default async function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerData = await fetchWebsiteHeader();

  return <WebsiteShell headerData={headerData}>{children}</WebsiteShell>;
}
