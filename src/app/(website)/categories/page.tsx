import type { Metadata } from "next";
import { CategoriesPageContent } from "@/components/website/categories/CategoriesPageContent";
import { fetchAllCategories } from "@/components/website/categories/categoriesApi";
import { JsonLd } from "@/components/website/seo/JsonLd";
import {
  getBreadcrumbSchema,
  getCollectionPageSchema,
} from "@/lib/schema";
import { SEO_PAGES, getStaticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getStaticPageMetadata("categories");

export default async function CategoriesPage() {
  const categories = await fetchAllCategories();
  const page = SEO_PAGES.categories;

  return (
    <>
      <JsonLd
        data={[
          getCollectionPageSchema({
            name:
              page.title.replace(/\s*\|\s*Vrindavan Rasa\s*$/i, "").trim() ||
              "Categories",
            path: "/categories",
            description: page.description,
          }),
          getBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Categories", path: "/categories" },
          ]),
        ]}
      />
      <CategoriesPageContent categories={categories} />
    </>
  );
}
