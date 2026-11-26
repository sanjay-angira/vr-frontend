import { unstable_cache } from "next/cache";
import { getData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import type { HomepageBanner } from "@/types/homepage";
import type { StoreListProduct } from "@/types/storeProduct";

type HomepageBannersApiResponse = {
  success: boolean;
  data?: HomepageBanner[];
};

type StoreProductsResponse = {
  success: boolean;
  message?: string;
  data?: {
    rows?: StoreListProduct[];
  };
};

type HomepageProductFilter =
  | "featured"
  | "newArrivals"
  | "bestSeller"
  | "bestDeals";

async function loadHomepageProducts(
  filter: HomepageProductFilter
): Promise<StoreListProduct[]> {
  const response = (await getData(
    API_ENDPOINTS.CUSTOMER.STORE_PRODUCTS,
    {
      pageNumber: 1,
      pageSize: 8,
      sortBy: "newest",
      [filter]: true,
    },
    { auth: false }
  )) as StoreProductsResponse;

  if (!response?.success) {
    throw new Error(response?.message || `Failed to load ${filter} products.`);
  }
  if (!Array.isArray(response.data?.rows)) {
    throw new Error(`The ${filter} products response is invalid.`);
  }

  return response.data.rows;
}

export const fetchFeaturedProducts = unstable_cache(
  () => loadHomepageProducts("featured"),
  ["storefront-homepage-featured-products"],
  { revalidate: 300 }
);

export const fetchNewArrivalProducts = unstable_cache(
  () => loadHomepageProducts("newArrivals"),
  ["storefront-homepage-new-arrival-products"],
  { revalidate: 300 }
);

export const fetchBestSellerProducts = unstable_cache(
  () => loadHomepageProducts("bestSeller"),
  ["storefront-homepage-best-seller-products"],
  { revalidate: 300 }
);

export const fetchBestDealProducts = unstable_cache(
  () => loadHomepageProducts("bestDeals"),
  ["storefront-homepage-best-deal-products"],
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
