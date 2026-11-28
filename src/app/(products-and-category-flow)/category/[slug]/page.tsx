import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryShopDescription } from "@/components/shop/CategoryShopDescription";
import { AllProducts } from "@/components/shop/AllProducts";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getBreadcrumbSchema,
  getCollectionPageSchema,
} from "@/lib/schema";
import { HeroBannerSection } from "@/components/sections/HeroBannerSection";
import API_ENDPOINTS from "@/services/api/API_ENDPOINT";
import { getData } from "@/services/api/apiService";
import Link from "next/link";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryShopPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const categoryRes = await getData(API_ENDPOINTS.CUSTOMER.CATEGORY_BY_SLUG(slug));
  if (!categoryRes?.success || !categoryRes.data) {
    notFound();
  }
  const categoryName =
    categoryRes.data.name || categoryRes.data.categoryName || "";
  const categorySlug =
    categoryRes.data.slug || categoryRes.data.categorySlug || slug;
  const category = {
    id: categoryRes.data.id,
    name: categoryName,
    slug: categorySlug,
    description:
      categoryRes.data.description || categoryRes.data.shortDescription || "",
    image: categoryRes.data.image || categoryRes.data.desktopImage || null,
    bannerImage: categoryRes.data.bannerImage || null,
  };
  const plainDescription = category.description
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const categoryPath = `/category/${category.slug}`;
  const schemas = [
    getCollectionPageSchema({
      name: category.name,
      path: categoryPath,
      description: plainDescription || undefined,
    }),
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Shop", path: "/products" },
      { name: category.name, path: categoryPath },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <HeroBannerSection banners={[categoryRes.data]} />
      <section className="store-catalog">
        <div className="container store-catalog__inner">
          <div className="store-catalog__category-head">
            <nav className="store-catalog__breadcrumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden>›</span>
              <Link href="/products">Shop</Link>
              <span aria-hidden>›</span>
              <h1 className="is-current">{category.name}</h1>
            </nav>
          </div>
          <Suspense fallback={<div className="store-catalog__layout" aria-busy="true" />}>
            <AllProducts slug={slug} />
          </Suspense>
          <CategoryShopDescription
            name={categoryName}
            description={category.description}
          />
        </div>
      </section>
    </>
  );
}
