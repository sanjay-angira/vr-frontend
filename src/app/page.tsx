import { Suspense } from "react";
import type { Metadata } from "next";
import { HomePageSkeleton } from "@/components/shared/HomePageSkeleton";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Category } from "@/components/cards/CategoryCard";
import { HeroBannerSection } from "@/components/sections/HeroBannerSection";
import { WhyChooseSection } from "@/components/sections/WhyChooseSection";
import { CategorySection } from "@/components/sections/CategorySection";
import { RecentlyViewedSection } from "@/components/sections/RecentlyViewedSection";
import { ProductSection } from "@/components/sections/ProductSection";
import { BlogSection } from "@/components/sections/BlogSection";
import type { SectionHeadingProps } from "@/components/shared/SectionHeading";
import type { StoreListProduct } from "@/types/storeProduct";
import type { HomepageBanner } from "@/types/homepage";
import { mapStoreListProduct } from "@/services/shopProductMapper";
import { getData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { getWebSiteSchema } from "@/lib/schema";
import { getStaticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getStaticPageMetadata("home");

const HOME_SECTION_HEADINGS: Record<string, SectionHeadingProps> = {
  whyChoose: {
    eyebrow: "✦ WHY SHOP WITH US ✦",
    title: "Why Choose",
    accent: "Vrindavan Rasa",
    description:
      "Discover carefully selected Indian groceries, spices, sweets, pooja essentials and lifestyle products, sourced with quality and authenticity in mind.",
  },
  categories: {
    eyebrow: "✦ SHOP BY CATEGORY ✦",
    title: "Shop Authentic Indian",
    accent: "Groceries & Essentials",
    description:
      "Explore authentic Indian spices, sweets, pooja essentials, dry fruits, snacks, personal care products and everyday household essentials—all in one place.",
  },
  recentlyViewed: {
    eyebrow: "✦ CONTINUE SHOPPING ✦",
    title: "Recently Viewed",
    accent: "Products",
    description:
      "Pick up where you left off and continue exploring your favorite products.",
  },
  featured: {
    eyebrow: "RECOMMENDED FOR YOU",
    title: "Popular Products",
    accent: "Customers Love",
    description:
      "Find premium products carefully selected to match your everyday needs and lifestyle.",
  },
  newArrivals: {
    eyebrow: "✦ NEW ARRIVALS ✦",
    title: "Discover New Products &",
    accent: "Everyday Essentials",
    description:
      "Be the first to explore newly added groceries, pooja products, traditional accessories, wellness items and more.",
  },
  bestSellers: {
    eyebrow: "✦ CUSTOMER FAVORITES ✦",
    title: "Best-Selling Indian",
    accent: "Groceries & Spices",
    description:
      "Shop the Indian groceries, authentic spices, snacks, sweets and everyday essentials loved by our customers.",
  },
  bestDeals: {
    eyebrow: "✦ SPECIAL OFFERS ✦",
    title: "Save More on Your",
    accent: "Everyday Essentials",
    description:
      "Discover limited-time offers and special prices on groceries, spices, snacks, wellness products and other customer favorites.",
  },
  blogs: {
    eyebrow: "✦ OUR BLOG ✦",
    title: "Latest Articles &",
    accent: "Healthy Living Tips",
    description:
      "Explore expert tips, healthy recipes, wellness guides, festive traditions, and buying advice to help you live healthier with Vrindavan Rasa.",
  },
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

type CategoryApiRow = {
  id: number;
  name: string;
  slug: string | null;
  description?: string;
  shortDescription?: string;
  image?: string | null;
  mobileImage?: string | null;
  productCount?: number;
};

type BlogApiRow = {
  id?: number | string;
  title?: string;
  slug?: string;
  excerpt?: string;
  image?: string;
  category?: string;
  date?: string;
  href?: string;
};

type BlogPost = {
  id: number;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  href: string;
};

export default function Page() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}

async function HomePageContent() {
  const [
    bannersResult,
    categoriesResult,
    featuredResult,
    newArrivalsResult,
    bestSellersResult,
    bestDealsResult,
    blogsResult,
  ] = await Promise.allSettled([
    getData(
      API_ENDPOINTS.CUSTOMER.HOMEPAGE_BANNERS,
      undefined,
      { auth: false }
    ).then((response: ApiResponse<HomepageBanner[]>) => {
      if (!response?.success || !Array.isArray(response.data)) {
        throw new Error(response?.message || "Invalid homepage banners response.");
      }
      return response.data;
    }),
    getData(
      API_ENDPOINTS.CUSTOMER.CATEGORIES,
      undefined,
      { auth: false }
    ).then(
      (
        response: ApiResponse<{
          rows?: CategoryApiRow[];
        }>
      ): Category[] => {
        if (!response?.success || !Array.isArray(response.data?.rows)) {
          throw new Error(response?.message || "Invalid categories response.");
        }

        return response.data.rows.map((row) => ({
          id: row.id,
          name: row.name,
          slug: row.slug || undefined,
          description: row.shortDescription || row.description || "",
          image: row.image || "",
          mobileImage: row.mobileImage || "",
          productCount: Number(row.productCount) || 0,
          href: row.slug
            ? `/category/${encodeURIComponent(row.slug)}`
            : "/products",
        }));
      }
    ),
    getData(
      API_ENDPOINTS.CUSTOMER.STORE_PRODUCTS,
      { pageNumber: 1, pageSize: 8, sortBy: "newest", featured: true },
      { auth: false }
    ).then((response: ApiResponse<{ rows?: StoreListProduct[] }>) => {
      if (!response?.success || !Array.isArray(response.data?.rows)) {
        throw new Error(response?.message || "Invalid featured products response.");
      }
      return response.data.rows;
    }),
    getData(
      API_ENDPOINTS.CUSTOMER.STORE_PRODUCTS,
      { pageNumber: 1, pageSize: 8, sortBy: "newest", newArrivals: true },
      { auth: false }
    ).then((response: ApiResponse<{ rows?: StoreListProduct[] }>) => {
      if (!response?.success || !Array.isArray(response.data?.rows)) {
        throw new Error(response?.message || "Invalid new-arrival products response.");
      }
      return response.data.rows;
    }),
    getData(
      API_ENDPOINTS.CUSTOMER.STORE_PRODUCTS,
      { pageNumber: 1, pageSize: 8, sortBy: "newest", bestSeller: true },
      { auth: false }
    ).then((response: ApiResponse<{ rows?: StoreListProduct[] }>) => {
      if (!response?.success || !Array.isArray(response.data?.rows)) {
        throw new Error(response?.message || "Invalid best-seller products response.");
      }
      return response.data.rows;
    }),
    getData(
      API_ENDPOINTS.CUSTOMER.STORE_PRODUCTS,
      { pageNumber: 1, pageSize: 8, sortBy: "newest", bestDeals: true },
      { auth: false }
    ).then((response: ApiResponse<{ rows?: StoreListProduct[] }>) => {
      if (!response?.success || !Array.isArray(response.data?.rows)) {
        throw new Error(response?.message || "Invalid special-offer products response.");
      }
      return response.data.rows;
    }),
    getData(
      API_ENDPOINTS.CUSTOMER.BLOGS,
      { pageNumber: 1, pageSize: 8 },
      { auth: false }
    ).then(
      (
        response: ApiResponse<{
          rows?: BlogApiRow[];
        }>
      ): BlogPost[] => {
        if (!response?.success || !Array.isArray(response.data?.rows)) {
          throw new Error(response?.message || "Invalid blog posts response.");
        }

        return response.data.rows.map((row) => {
          const slug = String(row.slug || "");
          return {
            id: Number(row.id) || 0,
            title: String(row.title || ""),
            excerpt: String(row.excerpt || ""),
            image: String(row.image || ""),
            category: String(row.category || "Blog"),
            date: String(row.date || ""),
            href: String(row.href || (slug ? `/blog/${slug}` : "/blogs")),
          };
        });
      }
    ),
  ]);
  const banners = getResultValue(bannersResult, "homepage banners", []);
  const categories = getResultValue(
    categoriesResult,
    "homepage categories",
    []
  );
  const featuredProducts = getResultValue(
    featuredResult,
    "featured products",
    []
  );
  const newArrivalProducts = getResultValue(
    newArrivalsResult,
    "new-arrival products",
    []
  );
  const bestSellerProducts = getResultValue(
    bestSellersResult,
    "best-seller products",
    []
  );
  const bestDealProducts = getResultValue(
    bestDealsResult,
    "special-offer products",
    []
  );
  const blogs = getResultValue(blogsResult, "homepage blog posts", []);

  const websiteLd = getWebSiteSchema();

  return (
    <>
      <JsonLd data={websiteLd} />
      {banners.length > 0 && <HeroBannerSection banners={banners} />}
      <WhyChooseSection heading={HOME_SECTION_HEADINGS.whyChoose} />
      {categories.length > 0 && (
        <CategorySection
          heading={HOME_SECTION_HEADINGS.categories}
          categories={categories.slice(0, 8)}
        />
      )}
      <RecentlyViewedSection heading={HOME_SECTION_HEADINGS.recentlyViewed} />
      <HomeProductSection
        title="View All Featured Products"
        heading={HOME_SECTION_HEADINGS.featured}
        products={featuredProducts}
      />
      <HomeProductSection
        title="View All New Arrivals"
        heading={HOME_SECTION_HEADINGS.newArrivals}
        products={newArrivalProducts}
      />
      <HomeProductSection
        title="View All Best Sellers"
        heading={HOME_SECTION_HEADINGS.bestSellers}
        products={bestSellerProducts}
      />
      <HomeProductSection
        title="View All Special Offers"
        heading={HOME_SECTION_HEADINGS.bestDeals}
        products={bestDealProducts}
      />
      {blogs.length > 0 && (
        <BlogSection
          heading={HOME_SECTION_HEADINGS.blogs}
          posts={blogs}
          viewAllLabel="View All Blogs"
        />
      )}
    </>
  );
}

function getResultValue<T>(
  result: PromiseSettledResult<T>,
  label: string,
  fallback: T
): T {
  if (result.status === "fulfilled") return result.value;
  console.error(`Failed to load ${label}:`, result.reason);
  return fallback;
}

function HomeProductSection({
  title,
  heading,
  products,
}: {
  title: string;
  heading: SectionHeadingProps;
  products: StoreListProduct[];
}) {
  if (products.length === 0) return null;

  return (
    <ProductSection
      heading={heading}
      products={products.map(mapStoreListProduct)}
      viewAllLink="/products"
      viewAllLabel={title}
    />
  );
}
