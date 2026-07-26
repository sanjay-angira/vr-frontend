import Link from "next/link";
import {
  SectionHeading,
  type SectionHeadingProps,
} from "@/components/website/shared/SectionHeading";
import {
  ProductCard,
  type WebsiteProductCardData,
} from "@/components/website/cards/ProductCard";

interface ProductSectionProps {
  heading: SectionHeadingProps;
  products: WebsiteProductCardData[];
  viewAllLink?: string;
}

export function ProductSection({
  heading,
  products,
  viewAllLink,
}: ProductSectionProps) {
  return (
    <section className="section home-section home-product-section">
      <div className="container">
        <SectionHeading {...heading} />
        <div className="home-product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              href={product.slug ? `/product/${product.slug}` : undefined}
            />
          ))}
        </div>
        {viewAllLink ? (
          <div className="home-section__actions">
            <Link href={viewAllLink} className="btn btn-outline btn-lg">
              View All {heading.title}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
