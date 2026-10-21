import { fetchFooterSections } from "@/services/website/footerService";
import { WebsiteFooterView } from "@/components/common/WebsiteFooterView";

export async function WebsiteFooter() {
  const sections = await fetchFooterSections();
  return <WebsiteFooterView sections={sections} />;
}
