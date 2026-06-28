import { fetchWebsiteHeader } from "@/services/website/headerService";
import { WebsiteHeaderView } from "@/components/common/WebsiteHeaderView";

export async function WebsiteHeader() {
  const data = await fetchWebsiteHeader();
  return <WebsiteHeaderView data={data} />;
}
