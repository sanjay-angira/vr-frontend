import ComboProductCard from "@/components/cards/ComboProductCard";
import type { ComboProduct } from "@/components/cards/ComboProductCard";
import SectionHeading from "../utilis/SectionHeadings";

interface ProductComboSectionProps {
  title: string;
  subtitle?: string;
  comboProducts: ComboProduct[];
  viewAllLink?: string;
}

const ProductComboSection = ({
  title,
  subtitle,
  comboProducts,
  viewAllLink,
}: ProductComboSectionProps) => {
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
            <a href={viewAllLink} className="combo-view-all-link">
              View All {title}
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductComboSection;
