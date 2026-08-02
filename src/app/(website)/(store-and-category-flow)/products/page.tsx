import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopPageContent } from "@/components/website/shop/ShopPageContent";
import { JsonLd } from "@/components/website/seo/JsonLd";
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

export default function ShopPage() {
  const shop = SEO_PAGES.shop;

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
      <Suspense fallback={<section className="store-catalog" aria-busy="true" />}>
        <ShopPageContent />
      </Suspense>
    </>
  );
}
