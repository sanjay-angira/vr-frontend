import { ArrowRight } from "lucide-react";
import {
  SectionHeading,
  type SectionHeadingProps,
} from "@/components/website/shared/SectionHeading";
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
  viewAllLabel?: string;
}

export function ProductSection({
  heading,
  products,
  viewAllLink,
  viewAllSeed,
  viewAllLabel,
}: ProductSectionProps) {
  const buttonLabel =
    viewAllLabel?.trim() ||
    `View All ${heading.title}`.trim() ||
    "View All";
  return (
    <section className="section home-section home-product-section">
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
              className="home-section__view-all"
            >
              {buttonLabel}
              <ArrowRight size={16} strokeWidth={1.75} />
            </ShopSeedLink>
          </div>
        ) : null}
      </div>
    </section>
  );
}
