import { SEED_PRODUCTS } from "@/components/website/data/products";
import { ProductCard } from "@/components/website/cards/ProductCard";

type CategoryListingPageProps = {
  title: string;
  subtitle: string;
  category: string;
};

export function CategoryListingPage({
  title,
  subtitle,
  category,
}: CategoryListingPageProps) {
  const items = SEED_PRODUCTS.filter((product) => product.category === category);

  return (
    <section className="products-section">
      <div className="container">
        <div className="section-header">
          <h1 className="section-title">{title}</h1>
          <p className="section-subtitle">{subtitle}</p>
        </div>
        <div className="products-grid">
          {items.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              image={product.image}
              title={product.title}
              price={String(product.price)}
              originalPrice={
                product.originalPrice ? String(product.originalPrice) : undefined
              }
              rating={product.rating}
              description={product.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
