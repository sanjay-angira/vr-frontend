import { getData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import type { FooterData, FooterListItem } from "@/types/footer";
import { buildLiveFooterData } from "@/utils/footerHelpers";

type FooterItemsApiResponse = {
  success?: boolean;
  data?: {
    items?: Array<{
      id?: number;
      label?: string;
      url?: string;
      position?: number;
      sectionTitle?: string;
      sectionPosition?: number;
    }>;
  };
};

export async function fetchFooterListItems(): Promise<FooterListItem[]> {
  try {
    const response = (await getData(API_ENDPOINTS.FOOTER.PUBLIC, undefined, {
      auth: false,
    })) as FooterItemsApiResponse;

    if (!response?.success || !response.data?.items) {
      return [];
    }

    return response.data.items
      .filter((row) => row?.id && row.label)
      .map((row) => ({
        id: Number(row.id),
        label: String(row.label),
        url: row.url || "",
        position: Number(row.position) || 0,
        sectionTitle: row.sectionTitle || "Information",
        sectionPosition: Number(row.sectionPosition) || 0,
      }));
  } catch {
    return [];
  }
}

export async function fetchFooterData(): Promise<FooterData> {
  const items = await fetchFooterListItems();
  return buildLiveFooterData(items);
}
