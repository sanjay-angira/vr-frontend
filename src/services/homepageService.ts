import { unstable_cache } from "next/cache";
import { getData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import type {
  HomepageBanner,
  HomepageProductSection,
  HomepageSectionCopy,
} from "@/types/homepage";
import type { StoreProductSectionOption } from "@/components/shop/StoreFiltersSidebar";
import type { StoreListProduct } from "@/types/storeProduct";

type HomepageBannersApiResponse = {
  success: boolean;
  data?: HomepageBanner[];
};

type StoreFiltersResponse = {
  success: boolean;
  message?: string;
  data?: {
    productSections?: StoreProductSectionOption[];
    homepageSectionCopy?: HomepageSectionCopy[];
  };
};

type StoreProductsResponse = {
  success: boolean;
  data?: {
    rows?: StoreListProduct[];
  };
};

type HomepageContent = {
  productSections: HomepageProductSection[];
  sectionCopy: HomepageSectionCopy[];
};

async function loadHomepageContent(): Promise<HomepageContent> {
  const filters = (await getData(
    API_ENDPOINTS.CUSTOMER.STORE_FILTERS,
    undefined,
    { auth: false }
  )) as StoreFiltersResponse;

  if (!filters?.success) {
    throw new Error(filters?.message || "Failed to load homepage sections.");
  }
  if (!Array.isArray(filters.data?.productSections)) {
    throw new Error("Homepage section response is invalid.");
  }
  if (!Array.isArray(filters.data.homepageSectionCopy)) {
    throw new Error("Homepage copy response is invalid.");
  }

  const sectionCopy = filters.data.homepageSectionCopy;
  const sectionCopyBySlug = new Map(
    sectionCopy.map((section) => [section.slug, section])
  );
  const sections = filters.data.productSections.filter(
    (section) =>
      section.type === "product_slider" &&
      section.slug?.trim() &&
      section.title?.trim()
  );
  const results = await Promise.allSettled(
    sections.map(async (section) => {
      const copy = sectionCopyBySlug.get(section.slug);
      const response = (await getData(
        API_ENDPOINTS.CUSTOMER.STORE_PRODUCTS,
        {
          pageNumber: 1,
          pageSize: copy?.maxProducts || 8,
          sectionSlugs: section.slug,
        },
        { auth: false }
      )) as StoreProductsResponse;

      if (!response?.success) {
        throw new Error("Product API returned an unsuccessful response.");
      }
      if (!Array.isArray(response.data?.rows)) {
        throw new Error("Product API returned an invalid product list.");
      }

      return {
        slug: section.slug,
        title: section.title,
        products: response.data.rows,
      };
    })
  );

  const productSections = results.flatMap((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `Failed to load homepage products for section "${sections[index].slug}":`,
        result.reason
      );
      return [];
    }

    return result.value.products.length > 0 ? [result.value] : [];
  });

  return { productSections, sectionCopy };
}

export const fetchHomepageContent = unstable_cache(
  loadHomepageContent,
  ["storefront-homepage-content"],
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
