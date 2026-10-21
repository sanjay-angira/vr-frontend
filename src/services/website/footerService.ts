import { unstable_cache } from "next/cache";
import { getData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import type { FooterSection } from "@/types/footer";

type CmsPage = {
  id: number;
  title: string;
  slug: string;
  type: "information" | "policy" | null;
  isActive: boolean;
};

type CmsPagesResponse = {
  success: boolean;
  data: {
    rows: CmsPage[];
    count: number;
  };
};

async function loadFooterSections(): Promise<FooterSection[]> {
  const pages: CmsPage[] = [];
  let pageNumber = 1;
  let count = 0;

  do {
    const response = (await getData(
      API_ENDPOINTS.CMS_PAGES.LIST,
      { pageNumber, pageSize: 100, column: "id", order: "ASC" },
      { auth: false },
    )) as CmsPagesResponse;

    if (
      !response?.success ||
      !Array.isArray(response.data?.rows) ||
      typeof response.data.count !== "number"
    ) {
      throw new Error("CMS Pages API returned an invalid response");
    }

    if (!response.data.rows.length && pages.length < response.data.count) {
      throw new Error("CMS Pages API returned an incomplete page");
    }

    pages.push(...response.data.rows);
    count = response.data.count;
    pageNumber += 1;
  } while (pages.length < count);

  return [
    { type: "information", title: "Information" },
    { type: "policy", title: "Policies" },
  ].flatMap(({ type, title }, sectionIndex) => {
    const items = pages
      .filter((page) => page.isActive && page.type === type)
      .map((page, index) => ({
        id: page.id,
        label: page.title,
        url: `/${page.slug}`,
        position: index + 1,
      }));

    return items.length
      ? [{ id: sectionIndex + 1, title, position: sectionIndex + 1, items }]
      : [];
  });
}

export const fetchFooterSections = unstable_cache(
  async () => {
    try {
      return await loadFooterSections();
    } catch (error) {
      console.error("Failed to load CMS Pages for the website footer", error);
      return [];
    }
  },
  ["customer-footer-sections"],
  { revalidate: 300 },
);
