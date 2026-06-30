import { getData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import type { HomepageApiResponse, HomepageSection } from "@/types/homepage";

export async function fetchHomepageSections(): Promise<HomepageSection[]> {
  try {
    const response = (await getData(API_ENDPOINTS.CUSTOMER.HOMEPAGE, undefined, {
      auth: false,
    })) as HomepageApiResponse;

    if (response?.success && Array.isArray(response.data?.sections)) {
      return response.data.sections;
    }
  } catch {
    return [];
  }

  return [];
}
