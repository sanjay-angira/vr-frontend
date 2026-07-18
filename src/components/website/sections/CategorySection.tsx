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
}

export function CategorySection({
  heading,
  categories,
  viewAllLink = "/categories",
}: CategorySectionProps) {
  return (
    <section className="section home-section category-section">
      <div className="container">
        <SectionHeading {...heading} />
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
        {viewAllLink ? (
          <div className="home-section__actions">
            <Link href={viewAllLink} className="btn btn-outline btn-lg">
              View All Categories
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
