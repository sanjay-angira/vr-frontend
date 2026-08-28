import Link from "next/link";
import type { ShopCategoryInfo } from "@/services/website/shopCatalogApi";

type CategoryShopHeaderProps = {
  category: ShopCategoryInfo;
};

/** Server-rendered category breadcrumbs (name is the page heading). */
export function CategoryShopHeader({ category }: CategoryShopHeaderProps) {
  return (
    <div className="store-catalog__category-head">
      <nav className="store-catalog__breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden>›</span>
        <Link href="/products">Shop</Link>
        <span aria-hidden>›</span>
        <h1 className="is-current">{category.name}</h1>
      </nav>
    </div>
  );
}
