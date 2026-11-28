import { JsonLd } from "@/components/seo/JsonLd";
import type { Category } from "@/components/cards/CategoryCard";
import { HeroBannerSection } from "@/components/sections/HeroBannerSection";
import { WhyChooseSection } from "@/components/sections/WhyChooseSection";
import { CategorySection } from "@/components/sections/CategorySection";
import { RecentlyViewedSection } from "@/components/sections/RecentlyViewedSection";
import { ProductSection } from "@/components/sections/ProductSection";
import { ProductReviewsShowcase } from "@/components/sections/ProductReviewsShowcase";
import { QualityPromiseSection } from "@/components/sections/QualityPromiseSection";
import { OurStorySection } from "@/components/sections/OurStorySection";
import { BlogSection } from "@/components/sections/BlogSection";
import type { SectionHeadingProps } from "@/components/shared/SectionHeading";
import type { StoreListProduct } from "@/types/storeProduct";
import type { HomepageBanner } from "@/types/homepage";
import { mapStoreListProduct } from "@/services/shopProductMapper";
import { getData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { getWebSiteSchema } from "@/lib/schema";

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
  reviews: {
    eyebrow: "✦ CUSTOMER REVIEWS ✦",
    title: "Loved by",
    accent: "Our Customers",
    description: "What customers are saying about products they love.",
  },
  blogs: {
    eyebrow: "✦ OUR BLOG ✦",
    title: "Latest Articles &",
    accent: "Healthy Living Tips",
    description:
      "Explore expert tips, healthy recipes, wellness guides, festive traditions, and buying advice to help you live healthier with Vrindavan Rasa.",
  },
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

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
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

type HomepageReviewRow = {
  id: number;
  rating: number | string;
  comment: string;
  userName: string;
  productName: string;
  createdAt: string;
};

export default async function HomePageContent() {
  const [
    bannersResult,
    categoriesResult,
    newArrivalsResult,
    bestSellersResult,
    bestDealsResult,
    blogsResult,
    reviewsResult,
  ] = await Promise.allSettled([
    getData(
      API_ENDPOINTS.CUSTOMER.HOMEPAGE_BANNERS,
      undefined,
      { auth: false }
    ),
    getData(
      API_ENDPOINTS.CUSTOMER.CATEGORIES,
      undefined,
      { auth: false }
    ),
    getData(
      API_ENDPOINTS.CUSTOMER.STORE_PRODUCTS,
      { pageNumber: 1, pageSize: 10, sortBy: "newest", newArrivals: true },
      { auth: false }
    ),
    getData(
      API_ENDPOINTS.CUSTOMER.STORE_PRODUCTS,
      { pageNumber: 1, pageSize: 10, sortBy: "newest", bestSeller: true },
      { auth: false }
    ),
    getData(
      API_ENDPOINTS.CUSTOMER.STORE_PRODUCTS,
      {
        pageNumber: 1,
        pageSize: 10,
        sortBy: "discount_desc",
        bestDeals: true,
      },
      { auth: false }
    ),
    getData(
      API_ENDPOINTS.CUSTOMER.BLOGS,
      { pageNumber: 1, pageSize: 3 },
      { auth: false }
    ),
    getData(API_ENDPOINTS.CUSTOMER.REVIEWS, undefined, { auth: false }),
  ]);

  const banners =
    getPromiseData<HomepageBanner[]>(
      bannersResult,
      "homepage banners"
    ) || [];
  const categories = getPromiseRows<CategoryApiRow>(
    categoriesResult,
    "homepage categories"
  ).map(mapCategory);
  const newArrivalProducts = getPromiseRows<StoreListProduct>(
    newArrivalsResult,
    "new-arrival products"
  );
  const bestSellerProducts = getPromiseRows<StoreListProduct>(
    bestSellersResult,
    "best-seller products"
  );
  const bestDealProducts = getPromiseRows<StoreListProduct>(
    bestDealsResult,
    "special-offer products"
  );
  const blogs = getPromiseRows<BlogApiRow>(
    blogsResult,
    "homepage blog posts"
  ).map(mapBlogPost);
  const reviews = getPromiseRows<HomepageReviewRow>(
    reviewsResult,
    "homepage reviews"
  ).map(mapHomepageReview)


  console.log("banners", reviews);

  return (
    <>
      <JsonLd data={getWebSiteSchema()} />
      <HeroBannerSection banners={banners} />
      <WhyChooseSection heading={HOME_SECTION_HEADINGS.whyChoose} />
      <CategorySection
        heading={HOME_SECTION_HEADINGS.categories}
        categories={categories.slice(0, 8)}
      />
      <HomeProductSection
        title="View All Best Sellers"
        heading={HOME_SECTION_HEADINGS.bestSellers}
        products={bestSellerProducts}
      />
      <QualityPromiseSection />
      <HomeProductSection
        title="View All New Arrivals"
        heading={HOME_SECTION_HEADINGS.newArrivals}
        products={newArrivalProducts}
      />
      <HomeProductSection
        title="View All Special Offers"
        heading={HOME_SECTION_HEADINGS.bestDeals}
        products={bestDealProducts}
      />
      <OurStorySection/>
      <ProductReviewsShowcase
        heading={HOME_SECTION_HEADINGS.reviews}
        reviews={reviews}
      />
      <BlogSection
        heading={HOME_SECTION_HEADINGS.blogs}
        posts={blogs}
        viewAllLabel="View All Blogs"
      />
      <RecentlyViewedSection heading={HOME_SECTION_HEADINGS.recentlyViewed} />
    </>
  );
}

function getPromiseData<T>(
  result: PromiseSettledResult<ApiResponse<T>>,
  label: string
): T | undefined {
  if (result.status === "rejected") {
    console.error(`Failed to load ${label}:`, result.reason);
    return undefined;
  }

  if (!result.value.success) {
    console.error(
      `Failed to load ${label}:`,
      result.value.message || "The API returned an unsuccessful response."
    );
    return undefined;
  }

  return result.value.data;
}

function getPromiseRows<T>(
  result: PromiseSettledResult<ApiResponse<{ rows?: T[] }>>,
  label: string
): T[] {
  const data = getPromiseData(result, label);
  if (!data) return [];

  const rows = data.rows;
  if (Array.isArray(rows)) return rows;

  console.error(`Invalid ${label} response: expected a rows array.`);
  return [];
}

function mapCategory(row: CategoryApiRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug || undefined,
    description: row.shortDescription || row.description || "",
    image: row.image || "",
    mobileImage: row.mobileImage || "",
    productCount: Number(row.productCount) || 0,
    href: row.slug ? `/category/${encodeURIComponent(row.slug)}` : "/products",
  };
}

function mapBlogPost(row: BlogApiRow): BlogPost {
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
}

function mapHomepageReview(row: HomepageReviewRow) {
  const rating = Number(row.rating);
  return {
    id: Number(row.id) || 0,
    comment: String(row.comment || ""),
    productName: String(row.productName || ""),
    userName: String(row.userName || "Customer"),
    rating: Number.isFinite(rating)
      ? Math.min(5, Math.max(0, Math.round(rating)))
      : 0,
    createdAt: String(row.createdAt || ""),
  };
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
  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <ProductSection
      heading={heading}
      products={products.map(mapStoreListProduct)}
      viewAllLink="/products"
      viewAllLabel={title}
    />
  );
}
