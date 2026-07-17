import { CategoryCard, type Category } from "@/components/website/cards/CategoryCard";

type CategoriesPageContentProps = {
  categories: Category[];
};

export function CategoriesPageContent({ categories }: CategoriesPageContentProps) {
  return (
    <section className="categories-page">
      <div className="container categories-page__inner">
        <header className="categories-page__hero">
          <p className="categories-page__eyebrow">Collections</p>
          <h1 className="categories-page__title">All Categories</h1>
          <p className="categories-page__subtitle">
            Browse every collection and find the offerings that speak to your devotion.
          </p>
        </header>

        <p className="categories-page__count">
          {categories.length} categor{categories.length === 1 ? "y" : "ies"}
        </p>

        {categories.length === 0 ? (
          <p className="categories-page__message">No categories available yet.</p>
        ) : (
          <div className="category-grid">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
