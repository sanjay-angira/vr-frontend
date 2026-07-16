import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";
import type { HomepageSection } from "@/types/homepage";
import type { WebsiteProductCardData } from "@/components/website/cards/ProductCard";
import type { Category } from "@/components/website/cards/CategoryCard";
import { CmsHeroBannerSection } from "@/components/website/home/CmsHeroBannerSection";
import { CategorySection } from "@/components/website/sections/CategorySection";
import { ProductSection } from "@/components/website/sections/ProductSection";
import { BlogSection } from "@/components/website/sections/BlogSection";
import { ProductReviewsShowcase } from "@/components/website/sections/ProductReviewsShowcase";

type CmsHomeSectionsProps = {
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

function getSectionTitle(section: HomepageSection) {
  return section.data.heading || section.title;
}

function getSectionSubtitle(section: HomepageSection) {
  return section.data.subHeading || undefined;
}

export function CmsHomeSections({ sections }: CmsHomeSectionsProps) {
  return (
    <>
      {sections.map((section) => {
        const key = `${section.type}-${section.id}`;

        switch (section.type) {
          case "hero_banner":
            return (
              <CmsHeroBannerSection
                key={key}
                title={getSectionTitle(section)}
                subtitle={getSectionSubtitle(section)}
                banners={section.banners}
              />
            );

          case "product_slider":
            if (section.products.length === 0) return null;
            return (
              <ProductSection
                key={key}
                title={getSectionTitle(section)}
                subtitle={getSectionSubtitle(section)}
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
                title={getSectionTitle(section)}
                subtitle={getSectionSubtitle(section)}
                categories={mapCategories(section.categories)}
              />
            );

          case "blog_section":
            if (section.blogs.length === 0) return null;
            return (
              <BlogSection
                key={key}
                title={getSectionTitle(section)}
                subtitle={getSectionSubtitle(section)}
                posts={mapBlogPosts(section.blogs)}
              />
            );

          case "review_section":
            if (section.reviews.length === 0) return null;
            return (
              <ProductReviewsShowcase
                key={key}
                title={getSectionTitle(section)}
                subtitle={getSectionSubtitle(section) || ""}
                reviews={section.reviews}
              />
            );

          case "custom":
            return (
              <div key={key}>
                {section.banners.length > 0 && (
                  <CmsHeroBannerSection
                    title={getSectionTitle(section)}
                    subtitle={getSectionSubtitle(section)}
                    banners={section.banners}
                  />
                )}
                {section.categories.length > 0 && (
                  <CategorySection
                    title={getSectionTitle(section)}
                    subtitle={getSectionSubtitle(section)}
                    categories={mapCategories(section.categories)}
                  />
                )}
                {section.products.length > 0 && (
                  <ProductSection
                    title={getSectionTitle(section)}
                    subtitle={getSectionSubtitle(section)}
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
                    title={getSectionTitle(section)}
                    subtitle={getSectionSubtitle(section)}
                    posts={mapBlogPosts(section.blogs)}
                  />
                )}
                {section.reviews.length > 0 && (
                  <ProductReviewsShowcase
                    title={getSectionTitle(section)}
                    subtitle={getSectionSubtitle(section) || ""}
                    reviews={section.reviews}
                  />
                )}
              </div>
            );

          default:
            return null;
        }
      })}
    </>
  );
}
