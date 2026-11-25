import { Suspense } from "react";
import type { Metadata } from "next";
import { HomePageSkeleton } from "@/components/shared/HomePageSkeleton";
import { HomePageSections } from "@/components/home/HomePageSections";
import { JsonLd } from "@/components/seo/JsonLd";
import { fetchAllCategories } from "@/components/categories/categoriesApi";
import { fetchBlogs } from "@/components/blog/blogApi";
import {
  fetchHomepageBanners,
  fetchHomepageContent,
} from "@/services/homepageService";
import { getWebSiteSchema } from "@/lib/schema";
import { getStaticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getStaticPageMetadata("home");

export default function Page() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}

async function HomePageContent() {
  const [contentResult, categoriesResult, bannersResult] =
    await Promise.allSettled([
      fetchHomepageContent(),
      fetchAllCategories(),
      fetchHomepageBanners(),
    ]);
  const homepageContent =
    contentResult.status === "fulfilled"
      ? contentResult.value
      : { productSections: [], sectionCopy: [] };
  const blogSection = homepageContent.sectionCopy.find(
    (section) => section.type === "blog_section"
  );
  const [blogsResult] = await Promise.allSettled([
    fetchBlogs({ pageSize: blogSection?.maxProducts || 8 }),
  ]);
  const productSections =
    homepageContent.productSections;
  const sectionCopy = homepageContent.sectionCopy;
  const categories =
    categoriesResult.status === "fulfilled"
      ? categoriesResult.value
      : [];
  const blogs =
    blogsResult.status === "fulfilled" ? blogsResult.value.rows : [];
  const banners =
    bannersResult.status === "fulfilled" ? bannersResult.value : [];

  if (contentResult.status === "rejected") {
    console.error("Failed to load homepage section data:", contentResult.reason);
  }
  if (categoriesResult.status === "rejected") {
    console.error("Failed to load homepage categories:", categoriesResult.reason);
  }
  if (blogsResult.status === "rejected") {
    console.error("Failed to load homepage blog posts:", blogsResult.reason);
  }
  if (bannersResult.status === "rejected") {
    console.error("Failed to load homepage banners:", bannersResult.reason);
  }

  const websiteLd = getWebSiteSchema();

  if (
    sectionCopy.length === 0 &&
    productSections.length === 0 &&
    categories.length === 0 &&
    blogs.length === 0 &&
    banners.length === 0
  ) {
    return (
      <>
        <JsonLd data={websiteLd} />
        <div className="container home-empty">
          <p className="home-empty__message">
            Homepage content is not available yet.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <JsonLd data={websiteLd} />
      <HomePageSections
        productSections={productSections}
        sectionCopy={sectionCopy}
        categories={categories}
        blogs={blogs}
        banners={banners}
      />
    </>
  );
}
