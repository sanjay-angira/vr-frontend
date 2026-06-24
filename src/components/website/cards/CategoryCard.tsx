import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface Category {
  id: number;
  name?: string;
  description?: string;
  image?: string;
  productCount?: number;
  href?: string;
}

const categoryLinks: Record<number, string> = {
  1: "/rudraksha",
  2: "/sweets",
  3: "/books",
  4: "/rashi",
};

export function CategoryCard({ category }: { category: Category }) {
  const href = category.href || categoryLinks[category.id] || "/shop";

  return (
    <Link href={href} className="category-card">
      <div className="category-card-media">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name || "Category"}
            className="category-card-image"
          />
        ) : (
          <div className="category-card-image category-card-image--placeholder" />
        )}
        <div className="category-card-overlay" />
        <div className="category-card-accent" aria-hidden />

        {typeof category.productCount === "number" && (
          <span className="category-card-badge">
            {category.productCount} Products
          </span>
        )}
      </div>

      <div className="category-card-content">
        <h3 className="category-card-title">{category.name}</h3>
        {category.description && (
          <p className="category-card-description">{category.description}</p>
        )}
        <span className="category-card-cta">
          Explore Collection
          <ArrowRight size={16} className="category-card-cta-icon" />
        </span>
      </div>
    </Link>
  );
}
