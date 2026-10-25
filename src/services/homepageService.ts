import { unstable_cache } from "next/cache";
import { getData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import type {
  HomepageApiResponse,
  HomepageBanner,
  HomepageSection,
} from "@/types/homepage";

type HomepageBannersApiResponse = {
  success: boolean;
  data?: HomepageBanner[];
};

async function loadHomepageSections(): Promise<HomepageSection[]> {
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

/** Shared across requests so a slow homepage API does not run on every visit. */
export const fetchHomepageSections = unstable_cache(
  loadHomepageSections,
  ["customer-homepage-sections"],
  { revalidate: 300 }
);

async function loadHomepageBanners(): Promise<HomepageBanner[]> {
  try {
    const response = (await getData(
      API_ENDPOINTS.CUSTOMER.HOMEPAGE_BANNERS,
      undefined,
      { auth: false }
    )) as HomepageBannersApiResponse;

    if (response?.success && Array.isArray(response.data)) {
      return response.data;
    }
  } catch {
    return [];
  }

  return [];
}

export const fetchHomepageBanners = unstable_cache(
  loadHomepageBanners,
  ["customer-homepage-banners"],
  { revalidate: 300 }
);
