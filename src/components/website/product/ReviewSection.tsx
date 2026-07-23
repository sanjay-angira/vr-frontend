import { Star } from "lucide-react";

export type Review = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
};

type ReviewSectionProps = {
  productId: string;
  reviews?: Review[];
};

export default function ReviewSection({ reviews = [] }: ReviewSectionProps) {
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  return (
    <section className="review-section">
      <div className="review-header">
        <h2 className="product-section-heading">Customer Reviews</h2>
        <div className="rating-summary">
          <div className="average-rating">
            <span className="rating-number">{averageRating}</span>
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  style={{
                    color: i < Math.round(Number(averageRating)) ? "var(--saffron-primary)" : "#ccc",
                    fill: i < Math.round(Number(averageRating)) ? "var(--saffron-primary)" : "none",
                  }}
                />
              ))}
            </div>
            <span className="review-count">({reviews.length} reviews)</span>
          </div>
        </div>
      </div>

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <h4 className="reviewer-name">{review.userName}</h4>
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        style={{
                          color: i < review.rating ? "var(--saffron-primary)" : "#ccc",
                          fill: i < review.rating ? "var(--saffron-primary)" : "none",
                        }}
                      />
                    ))}
                  </div>
                </div>
                <span className="review-date">{review.date}</span>
              </div>
              <div dangerouslySetInnerHTML={{ __html: review.comment }} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
