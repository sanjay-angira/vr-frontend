import type {
  HomepageBanner,
  HomepageProductSection,
  HomepageSectionCopy,
} from "@/types/homepage";
import type { Category } from "@/components/cards/CategoryCard";
import type { SectionHeadingProps } from "@/components/shared/SectionHeading";
import { HeroBannerSection } from "@/components/sections/HeroBannerSection";
import { CategorySection } from "@/components/sections/CategorySection";
import { ProductSection } from "@/components/sections/ProductSection";
import { BlogSection } from "@/components/sections/BlogSection";
import { WhyChooseSection } from "@/components/sections/WhyChooseSection";
import { RecentlyViewedSection } from "@/components/sections/RecentlyViewedSection";
import type { BlogListCard } from "@/components/blog/blogApi";
import { mapStoreListProduct } from "@/services/shopProductMapper";

type HomePageSectionsProps = {
  productSections: HomepageProductSection[];
  sectionCopy: HomepageSectionCopy[];
  categories: Category[];
  blogs: BlogListCard[];
  banners: HomepageBanner[];
};

function getSectionHeading(section: HomepageSectionCopy): SectionHeadingProps {
  return {
    eyebrow: section.subHeading || undefined,
    title: section.heading || section.title,
    accent: section.headingAccent || undefined,
    description: section.description || undefined,
  };
}

function getViewAllLabel(section: HomepageSectionCopy): string {
  return `View All ${section.title}`;
}

export function HomePageSections({
  productSections,
  sectionCopy,
  categories,
  blogs,
  banners,
}: HomePageSectionsProps) {
  const productsBySlug = new Map(
    productSections.map((section) => [section.slug, section.products])
  );

  return (
    <>
      {banners.length > 0 && <HeroBannerSection banners={banners} />}
      {sectionCopy.map((section) => {
        const key = `${section.type}-${section.slug}`;
        const heading = getSectionHeading(section);
        const customSection = (section.customSection || "")
          .trim()
          .toLowerCase();

        switch (section.type) {
          case "category_slider":
            if (categories.length === 0) return null;
            return (
              <CategorySection
                key={key}
                heading={heading}
                categories={categories.slice(0, section.maxProducts)}
                viewAllLabel={getViewAllLabel(section)}
              />
            );

          case "product_slider": {
            const products = productsBySlug.get(section.slug) || [];
            if (products.length === 0) return null;
            return (
              <ProductSection
                key={key}
                heading={heading}
                products={products.map(mapStoreListProduct)}
                viewAllLink="/products"
                viewAllLabel={getViewAllLabel(section)}
                viewAllSeed={{ sectionSlugs: [section.slug] }}
              />
            );
          }

          case "blog_section":
            if (blogs.length === 0) return null;
            return (
              <BlogSection
                key={key}
                heading={heading}
                posts={blogs.slice(0, section.maxProducts)}
                viewAllLabel={getViewAllLabel(section)}
              />
            );

          case "custom":
            if (customSection === "why_choose") {
              return <WhyChooseSection key={key} heading={heading} />;
            }
            if (customSection === "recently_viewed") {
              return (
                <RecentlyViewedSection
                  key={key}
                  heading={heading}
                  viewAllLabel={getViewAllLabel(section)}
                />
              );
            }
            return null;

          default:
            return null;
        }
      })}
    </>
  );
}
