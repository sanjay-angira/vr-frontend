import { Star,Quote } from "lucide-react";
import SectionHeading from "../utilis/SectionHeadings";

type ReviewItem = {
  id: number;
  quote: string;
  product: string;
  name: string;
  location: string;
  rating: number;
};



const ProductReviewsShowcase = ({ title, subtitle, reviews }: { title: string; subtitle: string; reviews: ReviewItem[] }) => {
  return (
    <section className="section">
      <div className="container">
        <SectionHeading 
          title={title}
          subtitle={subtitle}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {reviews.map((review) => (
            <article key={review.id} className="product-review-card">
              <div className="product-review-quote-mark" aria-hidden>
                <Quote className="w-8 h-8 text-primary/20 mb-3" />
              </div>

              <p className="product-review-quote">{review.quote}</p>

              <div className="product-review-stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < review.rating ? "review-star active" : "review-star"}
                  />
                ))}
              </div>

              <p className="product-review-product">{review.product}</p>
              <p className="product-review-name">{review.name}</p>
              <p className="product-review-location">{review.location}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductReviewsShowcase;
