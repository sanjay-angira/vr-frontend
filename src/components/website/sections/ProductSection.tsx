import {
  SectionHeading,
  type SectionHeadingProps,
} from "@/components/website/shared/SectionHeading";
import { SectionCorners } from "@/components/website/shared/SectionCorners";
import {
  ProductCard,
  type WebsiteProductCardData,
} from "@/components/website/cards/ProductCard";
import { ShopSeedLink } from "@/components/website/shop/ShopSeedLink";
import type { ShopFilterSeed } from "@/utils/shopFilterUrl";

interface ProductSectionProps {
  heading: SectionHeadingProps;
  products: WebsiteProductCardData[];
  viewAllLink?: string;
  viewAllSeed?: ShopFilterSeed;
}

export function ProductSection({
  heading,
  products,
  viewAllLink,
  viewAllSeed,
}: ProductSectionProps) {
  return (
    <section className="section home-section home-product-section has-section-corners">
      <SectionCorners />
      <div className="container">
        <SectionHeading {...heading} />
        <div className="home-product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {(viewAllLink || viewAllSeed) ? (
          <div className="home-section__actions">
            <ShopSeedLink
              href={viewAllLink}
              seed={viewAllSeed}
              className="btn btn-outline btn-lg"
            >
              View All {heading.title}
            </ShopSeedLink>
          </div>
        ) : null}
      </div>
    </section>
  );
}
