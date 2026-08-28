"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { HeaderParentCategory } from "@/components/website/categories/categoriesApi";

type HeaderCategoryNavProps = {
  categories: HeaderParentCategory[];
};

export function HeaderCategoryNav({ categories }: HeaderCategoryNavProps) {
  const pathname = usePathname();

  if (!categories.length) return null;

  const items = [
    { id: 0, name: "All Products", href: "/products", slug: "" },
    ...categories,
  ];

  return (
    <nav className="header-categories" aria-label="Product categories">
      <div className="container">
        <div className="header-categories__row">
          {items.map((item) => {
            const active =
              item.href === "/products"
                ? pathname === "/products"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.id || "all"}
                href={item.href}
                className={`header-categories__link${active ? " is-active" : ""}`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
