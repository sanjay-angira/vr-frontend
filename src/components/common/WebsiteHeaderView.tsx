import { WebsiteHeaderBar } from "@/components/header/WebsiteHeaderBar";
import type { HeaderParentCategory } from "@/components/categories/categoriesApi";

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
