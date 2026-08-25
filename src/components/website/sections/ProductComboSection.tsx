import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  ComboProductCard,
  type ComboProduct,
} from "@/components/website/cards/ComboProductCard";
import {
  SectionHeading,
  type SectionHeadingProps,
} from "@/components/website/shared/SectionHeading";

export function ProductComboSection({
  title,
  subtitle,
  accent,
  description,
  heading,
  comboProducts,
  viewAllLink,
  viewAllLabel,
}: {
  title?: string;
  subtitle?: string;
  accent?: string;
  description?: string;
  heading?: SectionHeadingProps;
  comboProducts: ComboProduct[];
  viewAllLink?: string;
  viewAllLabel?: string;
}) {
  const resolvedHeading: SectionHeadingProps = heading ?? {
    title: title ?? "",
    eyebrow: subtitle,
    accent,
    description,
  };

  const buttonLabel =
    viewAllLabel?.trim() ||
    resolvedHeading.title.trim() ||
    "View All Products";

  return (
    <section className="section home-section home-product-section combo-section">
      <div className="container">
        <SectionHeading {...resolvedHeading} />
        <div className="home-product-grid combo-grid">
          {comboProducts.map((combo) => (
            <ComboProductCard key={combo.id} combo={combo} />
          ))}
        </div>
        {viewAllLink ? (
          <div className="home-section__actions">
            <Link href={viewAllLink} className="home-section__view-all">
              {buttonLabel}
              <ArrowRight size={16} strokeWidth={1.75} />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
