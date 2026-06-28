import { fetchFooterData } from "@/services/website/footerService";
import { WebsiteFooterView } from "@/components/common/WebsiteFooterView";

export async function WebsiteFooter() {
  const footerData = await fetchFooterData();
  return <WebsiteFooterView data={footerData} />;
}
