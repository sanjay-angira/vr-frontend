import type { Metadata } from "next";
import { Suspense } from "react";
import { AllProducts } from "@/components/shop/AllProducts";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getBreadcrumbSchema,
  getCollectionPageSchema,
} from "@/lib/schema";
import {
  NOINDEX_FOLLOW_ROBOTS,
  SEO_PAGES,
  buildPageMetadata,
  getStaticPageMetadata,
} from "@/lib/seo";
import { getData } from "@/services/api/apiService";
import API_ENDPOINTS from "@/services/api/API_ENDPOINT";
import { HeroBannerSection } from "@/components/sections/HeroBannerSection";
import Link from "next/link";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const query = await searchParams;
  const searchValue = Array.isArray(query.search)
    ? query.search[0]
    : query.search;

  // Spec: Search results → noindex, follow
  if (searchValue?.trim()) {
    const term = searchValue.trim();
    return buildPageMetadata({
      title: `Search: ${term} | Vrindavan Rasa`,
      description: `Search results for “${term}” at Vrindavan Rasa.`,
      path: `/products?search=${encodeURIComponent(term)}`,
      robots: NOINDEX_FOLLOW_ROBOTS,
    });
  }

  return getStaticPageMetadata("shop");
}

export default async function ShopPage() {
  const shop = SEO_PAGES.shop;
  const banners = await getData(API_ENDPOINTS.CUSTOMER.HOMEPAGE_BANNERS);

  return (
    <>
      <JsonLd
        data={[
          getCollectionPageSchema({
            name: shop.title.replace(/\s*\|\s*Vrindavan Rasa\s*$/i, "").trim() || "Shop",
            path: "/products",
            description: shop.description,
          }),
          getBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/products" },
          ]),
        ]}
      />
      <HeroBannerSection banners={banners.data} />
      <section className="store-catalog">
        <div className="container store-catalog__inner">
          <div className="store-catalog__category-head">
            <nav className="store-catalog__breadcrumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden>›</span>
              <h1 className="is-current">All Products</h1>
            </nav>
          </div>
        </div>
        <Suspense fallback={<section className="store-catalog" aria-busy="true" />}>
          <AllProducts />
        </Suspense>
      </section>
    </>
  );
}
