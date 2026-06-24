import { CategoryCard, type Category } from "@/components/website/cards/CategoryCard";
import { SectionHeading } from "@/components/website/shared/SectionHeading";

interface CategorySectionProps {
  title: string;
  subtitle?: string;
  categories: Category[];
}

export function CategorySection({
  title,
  subtitle,
  categories,
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
      </div>
    </section>
  );
}
