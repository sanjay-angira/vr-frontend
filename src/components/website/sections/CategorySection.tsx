import { CategoryCard, type Category } from "@/components/website/cards/CategoryCard";
import { SectionHeading } from "@/components/website/shared/SectionHeading";
import Link from "next/link";

interface CategorySectionProps {
  title: string;
  subtitle?: string;
  categories: Category[];
  viewAllLink?: string;
}

export function CategorySection({
  title,
  subtitle,
  categories,
  viewAllLink = "/categories",
}: CategorySectionProps) {
  return (
    <section className="section category-section">
      <div className="container">
        <SectionHeading title={title} subtitle={subtitle} />
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
        {viewAllLink && (
          <div className="category-section__view-all">
            <Link href={viewAllLink} className="btn btn-outline btn-lg">
              View All Categories
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
