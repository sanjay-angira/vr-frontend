import { fetchParentCategories } from "@/components/website/categories/categoriesApi";
import { WebsiteHeaderView } from "@/components/common/WebsiteHeaderView";

export async function WebsiteHeader() {
  const categories = await fetchParentCategories();
  return <WebsiteHeaderView categories={categories} />;
}
