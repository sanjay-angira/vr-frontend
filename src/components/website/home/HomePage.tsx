import { fetchHomepageSections } from "@/services/website/homepageService";
import { CmsHomeSections } from "@/components/website/home/CmsHomeSections";
import { HeroSection } from "@/components/website/home/HeroSection";
import { CategorySection } from "@/components/website/sections/CategorySection";
import { ProductSection } from "@/components/website/sections/ProductSection";
import { WhyChooseSection } from "@/components/website/sections/WhyChooseSection";
import { ProductComboSection } from "@/components/website/sections/ProductComboSection";
import { WhyOnlyThisMasalaSection } from "@/components/website/sections/WhyOnlyThisMasalaSection";
import { ProductReviewsShowcase } from "@/components/website/sections/ProductReviewsShowcase";
import { BlogSection } from "@/components/website/sections/BlogSection";
import {
  bookProducts,
  homeBlogPosts,
  homeCategories,
  homeReviews,
  rudrakshaProducts,
} from "@/components/website/data/homeData";

function StaticHomeFallback() {
  return (
    <>
      <HeroSection />
      <CategorySection
        title="Browse by Category"
        subtitle="Our Collection"
        categories={homeCategories}
      />
      <ProductSection
        title="Popular Products"
        subtitle="Customer Favorites"
        products={rudrakshaProducts}
        viewAllLink="/products"
      />
      <WhyChooseSection />
      <ProductComboSection
        title="Exclusive Product Combos"
        subtitle="Best Buy"
        comboProducts={bookProducts}
        viewAllLink="/shop"
      />
      <WhyOnlyThisMasalaSection />
      <ProductReviewsShowcase
        title="What Customers Say"
        subtitle="Product Reviews"
        reviews={homeReviews}
      />
      <BlogSection
        posts={homeBlogPosts}
        title="Our Blog"
        subtitle="From The Kitchen"
      />
    </>
  );
}

export async function HomePage() {
  const sections = await fetchHomepageSections();

  return (
    <div style={{ minHeight: "100vh" }}>
      {sections.length > 0 ? (
        <CmsHomeSections sections={sections} />
      ) : (
        <StaticHomeFallback />
      )}
    </div>
  );
}
