import Link from "next/link";
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
}: {
  title?: string;
  subtitle?: string;
  accent?: string;
  description?: string;
  heading?: SectionHeadingProps;
  comboProducts: ComboProduct[];
  viewAllLink?: string;
}) {
  const resolvedHeading: SectionHeadingProps = heading ?? {
    title: title ?? "",
    eyebrow: subtitle,
    accent,
    description,
  };

  return (
    <section className="section combo-section">
      <div className="container">
        <SectionHeading {...resolvedHeading} />
        <div className="combo-grid">
          {comboProducts.map((combo) => (
            <ComboProductCard key={combo.id} combo={combo} />
          ))}
        </div>
        {viewAllLink && (
          <div className="combo-view-all-wrap">
            <Link href={viewAllLink} className="combo-view-all-link">
              View All {resolvedHeading.title}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
