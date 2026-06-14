import ProductCard from "@/components/cards/ProductCard";
import { PRODUCTS } from "@/data/products";

export default function RudrakshaPage() {
  const items = PRODUCTS.filter(p => p.category === 'rudraksha');
  return (
    <section className="products-section">
      <div className="container">
        <div className="section-header">
          <h1 className="section-title">Rudraksha</h1>
          <p className="section-subtitle">Authentic blessed beads for spiritual growth.</p>
        </div>
        <div className="products-grid">
          {items.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              image={p.image}
              title={p.title}
              price={String(p.price)}
              originalPrice={p.originalPrice ? String(p.originalPrice) : undefined}
              rating={p.rating}
              description={p.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}


