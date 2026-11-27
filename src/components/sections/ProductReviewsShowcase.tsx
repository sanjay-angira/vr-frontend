import { Quote, Star } from "lucide-react";
import {
  SectionHeading,
  type SectionHeadingProps,
} from "@/components/shared/SectionHeading";

type ReviewItem = {
  id: number;
  rating: number;
  comment: string;
  userName: string;
  productName: string;
  createdAt: string;
};


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
                className="product-review-stars"
                role="img"
                aria-label={`Rated ${review.rating} out of 5`}
              >
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
              <div
                className="product-review-quote rich-html"
                dangerouslySetInnerHTML={{ __html: review.comment || "" }}
              />
              <div className="product-review-author">
                <div className="product-review-author-copy">
                  <p className="product-review-name">{review.userName}</p>
                  {review.productName ? (
                    <p className="product-review-product">{review.productName}</p>
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
