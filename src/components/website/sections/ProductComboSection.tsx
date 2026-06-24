import Link from "next/link";
import {
  ComboProductCard,
  type ComboProduct,
} from "@/components/website/cards/ComboProductCard";
import { SectionHeading } from "@/components/website/shared/SectionHeading";

export function ProductComboSection({
  title,
  subtitle,
  comboProducts,
  viewAllLink,
}: {
  title: string;
  subtitle?: string;
  comboProducts: ComboProduct[];
  viewAllLink?: string;
}) {
  return (
    <section className="section combo-section">
      <div className="container">
        <SectionHeading title={title} subtitle={subtitle} />
        <div className="combo-grid">
          {comboProducts.map((combo) => (
            <ComboProductCard key={combo.id} combo={combo} />
          ))}
        </div>
        {viewAllLink && (
          <div className="combo-view-all-wrap">
            <Link href={viewAllLink} className="combo-view-all-link">
              View All {title}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
