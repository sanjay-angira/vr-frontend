import { unstable_cache } from "next/cache";
import type { FooterData } from "@/types/footer";
import { buildLiveFooterData } from "@/utils/footerHelpers";

export const fetchFooterData = unstable_cache(
  async (): Promise<FooterData> => buildLiveFooterData([]),
  ["customer-footer-sections"],
  { revalidate: 300 },
);
