import { ArrowRight, Flower2, Leaf, Truck } from "lucide-react";
import { CategoryCard, type Category } from "@/components/cards/CategoryCard";
import {
  SectionHeading,
  type SectionHeadingProps,
} from "@/components/shared/SectionHeading";
import Link from "next/link";

interface CategorySectionProps {
  heading: SectionHeadingProps;
  categories: Category[];
  viewAllLink?: string;
  viewAllLabel?: string;
}


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
