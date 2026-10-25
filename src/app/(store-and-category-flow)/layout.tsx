import type { ReactNode } from "react";

/**
 * Shared shell for store (`/products`) and category (`/category/[slug]`).
 * Matches tid-web `(store-and-category-flow)`: same listing layout for both.
 * Route group name does not appear in the URL.
 */
export default function StoreAndCategoryFlowLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
