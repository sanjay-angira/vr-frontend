import Link from "next/link";
import { SectionHeading } from "@/components/website/shared/SectionHeading";
import {
  ProductCard,
  type WebsiteProductCardData,
} from "@/components/website/cards/ProductCard";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: WebsiteProductCardData[];
  viewAllLink?: string;
}

export function ProductSection({
  title,
  subtitle,
  products,
  viewAllLink,
}: ProductSectionProps) {
  return (
    <section className="section">
      <div className="container">
        <SectionHeading title={title} subtitle={subtitle} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {viewAllLink && (
          <div className="text-center mt-10">
            <Link href={viewAllLink} className="btn btn-outline btn-lg">
              View All {title}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
