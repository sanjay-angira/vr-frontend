import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryShopDescription } from "@/components/website/shop/CategoryShopDescription";
import { CategoryShopHeader } from "@/components/website/shop/CategoryShopHeader";
import { ShopPageContent } from "@/components/website/shop/ShopPageContent";
import { JsonLd } from "@/components/website/seo/JsonLd";
import {
  getBreadcrumbSchema,
  getCollectionPageSchema,
} from "@/lib/schema";
import { getCategoryPageMetadata } from "@/lib/seo";
import { fetchCategoryShopPage } from "@/services/website/shopCatalogApi";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchCategoryShopPage(slug);

  if (!data?.category) {
    const label = slug
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    return getCategoryPageMetadata(label || "Category", { slug });
  }

  const plainDescription =
    data.category.description
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim() || undefined;

  return getCategoryPageMetadata(data.category.name, {
    slug: data.category.slug,
    description: plainDescription,
    image: data.category.image,
  });
}

export default async function CategoryShopPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const data = await fetchCategoryShopPage(slug, query);

  if (!data) {
    notFound();
  }

  const plainDescription =
    data.category.description
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim() || undefined;

  const categoryPath = `/category/${data.category.slug}`;
  const schemas = [
    getCollectionPageSchema({
      name: data.category.name,
      path: categoryPath,
      description: plainDescription,
    }),
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: data.category.name, path: categoryPath },
    ]),
  ];

  return (
    <section className="store-catalog">
      <JsonLd data={schemas} />
      <div className="container store-catalog__inner">
        <CategoryShopHeader category={data.category} />

        <Suspense
          fallback={<div className="store-catalog__layout" aria-busy="true" />}
        >
          <ShopPageContent
            categorySlug={data.category.slug}
            initialData={data}
            hideCategoryChrome
            embedded
          />
        </Suspense>

        <CategoryShopDescription
          name={data.category.name}
          description={data.category.description}
        />
      </div>
    </section>
  );
}
