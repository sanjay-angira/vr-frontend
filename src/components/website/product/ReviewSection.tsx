"use client";
import { useState } from "react";
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

// Sample reviews for demonstration
const sampleReviews: Review[] = [
  {
    id: "1",
    userName: "Priya Sharma",
    rating: 5,
    comment: "Excellent quality! The rudraksha beads are authentic and beautifully crafted. Very satisfied with my purchase.",
    date: "12/15/2024"
  },
  {
    id: "2", 
    userName: "Rajesh Kumar",
    rating: 4,
    comment: "Good product, fast delivery. The packaging was secure and the item arrived in perfect condition.",
    date: "12/10/2024"
  },
  {
    id: "3",
    userName: "Anita Patel",
    rating: 5,
    comment: "Amazing spiritual energy from this product. Highly recommend for anyone on a spiritual journey.",
    date: "12/08/2024"
  },
  {
    id: "4",
    userName: "Vikram Singh",
    rating: 4,
    comment: "Quality is good but delivery took a bit longer than expected. Overall satisfied with the product.",
    date: "12/05/2024"
  },
  {
    id: "5",
    userName: "Sunita Reddy",
    rating: 5,
    comment: "Perfect! Exactly as described. The craftsmanship is outstanding and the spiritual significance is truly felt.",
    date: "12/01/2024"
  }
];

export default function ReviewSection({ productId, reviews = [] }: ReviewSectionProps) {
  const [userReviews, setUserReviews] = useState<Review[]>(reviews.length > 0 ? reviews : sampleReviews);
  const [newReview, setNewReview] = useState({
    userName: "",
    rating: 0,
    comment: "",
  });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReview.userName && newReview.rating > 0 && newReview.comment) {
      const review: Review = {
        id: Date.now().toString(),
        ...newReview,
        date: new Date().toLocaleDateString(),
      };
      setUserReviews([review, ...userReviews]);
      setNewReview({ userName: "", rating: 0, comment: "" });
      setShowForm(false);
    }
  };

  const averageRating = userReviews.length > 0 
    ? (userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length).toFixed(1)
    : "0.0";

  return (
    <section className="review-section">
      <div className="review-header">
        <h2 className="section-title">Customer Reviews</h2>
        <div className="rating-summary">
          <div className="average-rating">
            <span className="rating-number">{averageRating}</span>
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  style={{ 
                    color: i < Math.round(Number(averageRating)) ? 'var(--saffron-primary)' : '#ccc',
                    fill: i < Math.round(Number(averageRating)) ? 'var(--saffron-primary)' : 'none'
                  }}
                />
              ))}
            </div>
            <span className="review-count">({userReviews.length} reviews)</span>
          </div>
        </div>
      </div>

      <button 
        className="btn btn-outline"
        onClick={() => setShowForm(!showForm)}
        style={{ marginBottom: "2rem" }}
      >
        Write a Review
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label htmlFor="userName">Your Name</label>
            <input
              type="text"
              id="userName"
              value={newReview.userName}
              onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Rating</label>
            <div className="rating-input">
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`star-btn ${i < newReview.rating ? 'active' : ''}`}
                  onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
                >
                  <Star size={24} />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="comment">Your Review</label>
            <textarea
              id="comment"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Submit Review</button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="reviews-list">
        {userReviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
        ) : (
          userReviews.map((review) => (
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
                          color: i < review.rating ? 'var(--saffron-primary)' : '#ccc',
                          fill: i < review.rating ? 'var(--saffron-primary)' : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>
                <span className="review-date">{review.date}</span>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
