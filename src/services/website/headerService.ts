import { getData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import type {
  WebsiteHeaderApiResponse,
  WebsiteHeaderData,
} from "@/types/header";
import { DEFAULT_WEBSITE_HEADER as FALLBACK } from "@/types/header";

export async function fetchWebsiteHeader(): Promise<WebsiteHeaderData> {
  try {
    const response = (await getData(API_ENDPOINTS.HEADER.WEBSITE_HEADER, undefined, {
      auth: false,
    })) as WebsiteHeaderApiResponse;

    if (response?.success && response?.data) {
      return response.data;
    }
  } catch {
    return FALLBACK;
  }

  return FALLBACK;
}

export { FALLBACK as getFallbackWebsiteHeader };
