import type { Metadata } from "next";
import { CategoriesPageContent } from "@/components/website/categories/CategoriesPageContent";
import { fetchAllCategories } from "@/components/website/categories/categoriesApi";

export const metadata: Metadata = {
  title: "Categories | Vrindavan Rasa",
  description: "Browse all product categories from Vrindavan Rasa.",
};

export default async function CategoriesPage() {
  const categories = await fetchAllCategories();

  return <CategoriesPageContent categories={categories} />;
}
