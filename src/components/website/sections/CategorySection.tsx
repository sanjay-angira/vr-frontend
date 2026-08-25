import { ArrowRight, Flower2, Leaf, Truck } from "lucide-react";
import { CategoryCard, type Category } from "@/components/website/cards/CategoryCard";
import {
  SectionHeading,
  type SectionHeadingProps,
} from "@/components/website/shared/SectionHeading";
import Link from "next/link";

interface CategorySectionProps {
  heading: SectionHeadingProps;
  categories: Category[];
  viewAllLink?: string;
  viewAllLabel?: string;
}

const highlights = [
  {
    id: "quality",
    icon: Leaf,
    label: "Premium Quality",
    detail: "Handpicked Products",
  },
  {
    id: "variety",
    icon: Flower2,
    label: "Wide Variety",
    detail: "Everything You Need",
  },
  {
    id: "fast",
    icon: Truck,
    label: "Fast & Reliable",
    detail: "Quick Delivery",
  },
] as const;

export function CategorySection({
  heading,
  categories,
  viewAllLink = "/categories",
  viewAllLabel,
}: CategorySectionProps) {
  const buttonLabel = viewAllLabel?.trim() || "View All Categories";
  return (
    <section className="section home-section category-section">
      <div className="container category-section__inner">
        <SectionHeading {...heading} showDivider={false} />
        <ul className="category-section__highlights">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="category-section__highlight">
                <span className="category-section__highlight-icon" aria-hidden>
                  <Icon size={18} strokeWidth={1.55} />
                </span>
                <span className="category-section__highlight-copy">
                  <span className="category-section__highlight-label">
                    {item.label}
                  </span>
                  <span className="category-section__highlight-detail">
                    {item.detail}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
        {viewAllLink ? (
          <div className="home-section__actions">
            <Link href={viewAllLink} className="home-section__view-all">
              {buttonLabel}
              <ArrowRight size={16} strokeWidth={1.75} />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
