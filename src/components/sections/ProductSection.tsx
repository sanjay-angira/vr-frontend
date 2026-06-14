import SectionHeading from "../utilis/SectionHeadings";
import { ProductCard } from "../cards/ProductCard";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: any;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  benefits?: string[];
}

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
}

const ProductSection = ({ title, subtitle, products, viewAllLink }: ProductSectionProps) => {
  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          title={title}
          subtitle={subtitle}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product, index) => {
            return (
              <div key={index} className="flex flex-col">
                <div className="flex-1">
                  <ProductCard
                    product={product}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {viewAllLink && (
          <div className="text-center mt-10">
            <button className="btn btn-outline btn-lg">
              View All {title}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;