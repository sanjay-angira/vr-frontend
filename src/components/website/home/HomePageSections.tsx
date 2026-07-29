import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";
import type { HomepageSection } from "@/types/homepage";
import type { WebsiteProductCardData } from "@/components/website/cards/ProductCard";
import type { Category } from "@/components/website/cards/CategoryCard";
import type { SectionHeadingProps } from "@/components/website/shared/SectionHeading";
import { HeroBannerSection } from "@/components/website/sections/HeroBannerSection";
import { CategorySection } from "@/components/website/sections/CategorySection";
import { ProductSection } from "@/components/website/sections/ProductSection";
import { BlogSection } from "@/components/website/sections/BlogSection";
import { ProductReviewsShowcase } from "@/components/website/sections/ProductReviewsShowcase";
import { WhyChooseSection } from "@/components/website/sections/WhyChooseSection";
import { RecentlyViewedSection } from "@/components/website/sections/RecentlyViewedSection";

type HomePageSectionsProps = {
  sections: HomepageSection[];
};

function mapProducts(products: HomepageSection["products"]): WebsiteProductCardData[] {
  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: product.price,
    originalPrice:
      product.originalPrice && product.originalPrice > product.price
        ? product.originalPrice
        : undefined,
    image: resolveImageUrl(product.image),
    category: product.category,
    rating: product.rating,
    reviewCount: product.reviewCount,
    inStock: product.inStock,
  }));
}

function mapCategories(categories: HomepageSection["categories"]): Category[] {
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    image: resolveImageUrl(category.image),
    href: category.href,
  }));
}

function mapBlogPosts(blogs: HomepageSection["blogs"]) {
  return blogs.map((blog) => ({
    id: blog.id,
    title: blog.title,
    excerpt: blog.excerpt,
    image: resolveImageUrl(blog.image),
    category: blog.category,
    date: blog.date,
    href: blog.href,
  }));
}

export function getSectionHeadingProps(section: HomepageSection): SectionHeadingProps {
  const data = (section.data ?? {}) as HomepageSection["data"] &
    Record<string, unknown>;

  const title = String(data.heading || section.title || "").trim();
  const accent = String(
    data.headingAccent || data.accent || data.accentWord || "",
  ).trim();
  const eyebrow = String(data.subHeading || data.eyebrow || "").trim();
  const description = String(data.description || "").trim();

  return {
    eyebrow: eyebrow || undefined,
    title,
    accent: accent || undefined,
    description: description || undefined,
  };
}

export function HomePageSections({ sections }: HomePageSectionsProps) {
  return (
    <>
      {sections.map((section) => {
        const key = `${section.type}-${section.id}`;
        const heading = getSectionHeadingProps(section);

        switch (section.type) {
          case "hero_banner":
            return (
              <HeroBannerSection
                key={key}
                title={heading.title}
                subtitle={heading.eyebrow}
                banners={section.banners}
                effect={section.data?.bannerEffect}
              />
            );

          case "product_slider":
            if (section.products.length === 0) return null;
            return (
              <ProductSection
                key={key}
                heading={heading}
                products={mapProducts(section.products)}
                viewAllLink={
                  section.slug
                    ? `/products?section=${encodeURIComponent(section.slug)}`
                    : "/products"
                }
              />
            );

          case "category_slider":
            if (section.categories.length === 0) return null;
            return (
              <CategorySection
                key={key}
                heading={heading}
                categories={mapCategories(section.categories)}
              />
            );

          case "blog_section":
            if (section.blogs.length === 0) return null;
            return (
              <BlogSection
                key={key}
                heading={heading}
                posts={mapBlogPosts(section.blogs)}
              />
            );

          case "review_section":
            if (section.reviews.length === 0) return null;
            return (
              <ProductReviewsShowcase
                key={key}
                heading={heading}
                reviews={section.reviews}
              />
            );

          case "custom": {
            const customKey = String(
              section.data?.customSection || section.data?.sectionName || "",
            )
              .trim()
              .toLowerCase();

            if (customKey === "why_choose") {
              return (
                <WhyChooseSection
                  key={key}
                  heading={heading}
                />
              );
            }

            if (customKey === "recently_viewed") {
              return (<RecentlyViewedSection
                key={key}
                heading={heading}
              />
              );
            }

            return (
              <div key={key}>
                {section.banners.length > 0 && (
                  <HeroBannerSection
                    title={heading.title}
                    subtitle={heading.eyebrow}
                    banners={section.banners}
                    effect={section.data?.bannerEffect}
                  />
                )}
                {section.categories.length > 0 && (
                  <CategorySection
                    heading={heading}
                    categories={mapCategories(section.categories)}
                  />
                )}
                {section.products.length > 0 && (
                  <ProductSection
                    heading={heading}
                    products={mapProducts(section.products)}
                    viewAllLink={
                      section.slug
                        ? `/products?section=${encodeURIComponent(section.slug)}`
                        : "/products"
                    }
                  />
                )}
                {section.blogs.length > 0 && (
                  <BlogSection
                    heading={heading}
                    posts={mapBlogPosts(section.blogs)}
                  />
                )}
                {section.reviews.length > 0 && (
                  <ProductReviewsShowcase
                    heading={heading}
                    reviews={section.reviews}
                  />
                )}
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </>
  );
}
