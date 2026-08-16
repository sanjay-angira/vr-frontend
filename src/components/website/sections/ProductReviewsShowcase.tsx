import { Quote, Star } from "lucide-react";
import {
  SectionHeading,
  type SectionHeadingProps,
} from "@/components/website/shared/SectionHeading";
import { SectionCorners } from "@/components/website/shared/SectionCorners";

type ReviewItem = {
  id: number;
  quote: string;
  product: string;
  name: string;
  location: string;
  rating: number;
};

export function ProductReviewsShowcase({
  heading,
  reviews,
}: {
  heading: SectionHeadingProps;
  reviews: ReviewItem[];
}) {
  return (
    <section className="section home-section product-reviews-showcase has-section-corners">
      <SectionCorners variant="ornate" />
      <div className="container">
        <SectionHeading {...heading} />
        <div className="product-reviews-grid">
          {reviews.map((review) => (
            <article key={review.id} className="product-review-card">
              <div className="product-review-quote-mark" aria-hidden>
                <Quote size={28} />
              </div>
              <div
                className="product-review-quote rich-html"
                dangerouslySetInnerHTML={{ __html: review.quote || "" }}
              />
              <div className="product-review-stars" aria-label={`Rated ${review.rating} out of 5`}>
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    size={16}
                    className={
                      index < review.rating ? "review-star active" : "review-star"
                    }
                    fill={index < review.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>
              {review.product ? (
                <p className="product-review-product">{review.product}</p>
              ) : null}
              <p className="product-review-name">{review.name}</p>
              {review.location ? (
                <p className="product-review-location">{review.location}</p>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
