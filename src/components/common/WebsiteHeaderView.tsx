import { WebsiteHeaderBar } from "@/components/website/header/WebsiteHeaderBar";
import type { HeaderParentCategory } from "@/components/website/categories/categoriesApi";

type WebsiteHeaderViewProps = {
  categories: HeaderParentCategory[];
};

export function WebsiteHeaderView({ categories }: WebsiteHeaderViewProps) {
  return (
    <header className="header header--sticky">
      <WebsiteHeaderBar categories={categories} />
    </header>
  );
}
