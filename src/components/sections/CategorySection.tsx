import CategoryCard, { Category } from '../cards/CategoryCard';
import SectionHeading from '../utilis/SectionHeadings';

interface CategorySectionProps {
  title: string;
  subtitle?: string;
  categories: Category[];
  viewAllLink?: string;
}

const CategorySection = ({ title, subtitle, categories }: CategorySectionProps) => {
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
};

export default CategorySection;
