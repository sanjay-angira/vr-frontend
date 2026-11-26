import { Suspense } from "react";
import type { Metadata } from "next";
import { HomePageSkeleton } from "@/components/shared/HomePageSkeleton";
import { JsonLd } from "@/components/seo/JsonLd";
import { fetchAllCategories } from "@/components/categories/categoriesApi";
import { fetchBlogs } from "@/components/blog/blogApi";
import { HeroBannerSection } from "@/components/sections/HeroBannerSection";
import { WhyChooseSection } from "@/components/sections/WhyChooseSection";
import { CategorySection } from "@/components/sections/CategorySection";
import { RecentlyViewedSection } from "@/components/sections/RecentlyViewedSection";
import { ProductSection } from "@/components/sections/ProductSection";
import { BlogSection } from "@/components/sections/BlogSection";
import type { SectionHeadingProps } from "@/components/shared/SectionHeading";
import type { StoreListProduct } from "@/types/storeProduct";
import { mapStoreListProduct } from "@/services/shopProductMapper";
import {
  fetchBestDealProducts,
  fetchBestSellerProducts,
  fetchFeaturedProducts,
  fetchHomepageBanners,
  fetchNewArrivalProducts,
} from "@/services/homepageService";
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
    fetchHomepageBanners(),
    fetchAllCategories(),
    fetchFeaturedProducts(),
    fetchNewArrivalProducts(),
    fetchBestSellerProducts(),
    fetchBestDealProducts(),
    fetchBlogs({ pageSize: 8 }),
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
  const blogs = getResultValue(blogsResult, "homepage blog posts", {
    rows: [],
    count: 0,
    pageNumber: 1,
    pageSize: 8,
  }).rows;

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
