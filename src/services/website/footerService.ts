import { unstable_cache } from "next/cache";
import { getData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import type { FooterData, FooterSection } from "@/types/footer";
import { buildLiveFooterData } from "@/utils/footerHelpers";

type CmsPage = {
  id: number;
  title: string;
  slug: string;
  type: "information" | "policy" | null;
  isActive: boolean;
};

type CmsPagesResponse = {
  success?: boolean;
  data?: {
    rows?: CmsPage[];
    count?: number;
  };
};

async function loadCmsPages(): Promise<CmsPage[]> {
  const response = await getData(
    API_ENDPOINTS.CMS_PAGES.LIST,
    { pageNumber:1, pageSize: 100, column: "id", order: "ASC" },
    { auth: false },
  ) as CmsPagesResponse;
  debugger
  console.log("dddddddddddddddddddddddd",response);
  
  return response.data?.rows || [];
}

function toFooterSections(pages: CmsPage[]): FooterSection[] {
  const types = [
    { type: "information", title: "Information", position: 1 },
    { type: "policy", title: "Policies", position: 2 },
  ] as const;

  return types.flatMap(({ type, title, position }) => {
    const items = pages
      .filter((page) => page.isActive && page.type === type)
      .map((page, index) => ({
        id: page.id,
        label: page.title,
        url: `/${page.slug}`,
        position: index + 1,
      }));

    return items.length > 0
      ? [{ id: position, title, type: "menu", position, items }]
      : [];
  });
}

export const fetchFooterData = unstable_cache(
  async (): Promise<FooterData> => {
    try {
      return buildLiveFooterData(toFooterSections(await loadCmsPages()));
    } catch (error) {
      console.error("Failed to load CMS Pages for the website footer", error);
      return buildLiveFooterData([]);
    }
  },
  ["customer-footer-sections"],
  { revalidate: 300 },
);
