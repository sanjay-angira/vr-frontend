import { Quote, Star } from "lucide-react";
import {
  SectionHeading,
  type SectionHeadingProps,
} from "@/components/website/shared/SectionHeading";

type ReviewItem = {
  id: number;
  quote: string;
  product: string;
  name: string;
  location: string;
  rating: number;
};

function authorInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "VR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function ProductReviewsShowcase({
  heading,
  reviews,
}: {
  heading: SectionHeadingProps;
  reviews: ReviewItem[];
}) {
  return (
    <section className="section home-section product-reviews-showcase">
      <div className="container">
        <SectionHeading {...heading} />
        <div className="product-reviews-grid">
          {reviews.map((review) => (
            <article key={review.id} className="product-review-card">
              <div className="product-review-quote-mark" aria-hidden>
                <Quote size={22} />
              </div>
              <div
                className="product-review-quote rich-html"
                dangerouslySetInnerHTML={{ __html: review.quote || "" }}
              />
              <div className="product-review-stars" aria-label={`Rated ${review.rating} out of 5`}>
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    size={14}
                    className={
                      index < review.rating ? "review-star active" : "review-star"
                    }
                    fill={index < review.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <div className="product-review-author">
                <span className="product-review-avatar" aria-hidden>
                  {authorInitials(review.name || "")}
                </span>
                <div className="product-review-author-copy">
                  <p className="product-review-name">{review.name}</p>
                  {review.location ? (
                    <p className="product-review-location">{review.location}</p>
                  ) : null}
                  {review.product ? (
                    <p className="product-review-product">{review.product}</p>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
