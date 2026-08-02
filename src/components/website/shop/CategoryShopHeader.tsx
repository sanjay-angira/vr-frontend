import Link from "next/link";
import type { ShopCategoryInfo } from "@/services/website/shopCatalogApi";

type CategoryShopHeaderProps = {
  category: ShopCategoryInfo;
};

/** Server-rendered category title + breadcrumbs. */
export function CategoryShopHeader({ category }: CategoryShopHeaderProps) {
  return (
    <div className="store-catalog__category-head">
      <nav className="store-catalog__breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden>›</span>
        <Link href="/products">Shop</Link>
        <span aria-hidden>›</span>
        <span className="is-current">{category.name}</span>
      </nav>
      <h1 className="store-catalog__category-title">{category.name}</h1>
    </div>
  );
}
