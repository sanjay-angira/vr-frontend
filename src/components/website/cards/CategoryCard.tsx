import Link from "next/link";
import {
  ArrowRight,
  Cookie,
  CookingPot,
  CupSoda,
  Flower2,
  Leaf,
  Soup,
  Wheat,
  type LucideIcon,
} from "lucide-react";

export interface Category {
  id: number;
  name?: string;
  description?: string;
  image?: string;
  productCount?: number;
  href?: string;
}

function resolveCategoryIcon(name?: string): LucideIcon {
  const key = (name || "").toLowerCase();

  if (/spice|masala|seasoning|herb/.test(key)) return Flower2;
  if (/snack|namkeen|mixture|chips/.test(key)) return Soup;
  if (/sweet|mithai|dessert|ladoo|halwa/.test(key)) return Cookie;
  if (/tea|coffee|drink|beverage|juice/.test(key)) return CupSoda;
  if (/flour|atta|grain|rice|dal|pulse/.test(key)) return Wheat;
  if (/cook|kitchen|ready|meal/.test(key)) return CookingPot;

  return Leaf;
}

export function CategoryCard({ category }: { category: Category }) {
  const href =
    category.href ||
    (category.id ? `/products?categoryIds=${category.id}` : "/products");
  const Icon = resolveCategoryIcon(category.name);

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
      </div>

      <div className="category-card-content">
        <span className="category-card-icon" aria-hidden>
          <Icon size={18} strokeWidth={1.75} />
        </span>

        <h3 className="category-card-title">{category.name}</h3>
        <span className="category-card-divider" aria-hidden />

        {category.description && (
          <p className="category-card-description">{category.description}</p>
        )}

        <span className="category-card-cta">
          Explore Collection
          <ArrowRight size={15} className="category-card-cta-icon" />
        </span>
      </div>
    </Link>
  );
}
