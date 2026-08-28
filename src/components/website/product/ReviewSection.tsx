"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ShieldCheck,
  Star,
} from "lucide-react";
import { toast } from "react-toastify";
import { postData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { useAppDispatch, useAppSelector } from "@/services/redux/hooks";
import { selectUserAuth } from "@/services/redux/selectors";
import { setAuthModalOpen } from "@/services/redux/slices/websiteSlices/modalSlice";

export type Review = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  createdAt?: string;
  verified?: boolean;
};

type ReviewSectionProps = {
  productId: number;
  reviews?: Review[];
};

const STAR_FILTERS = [5, 4, 3, 2, 1] as const;
type SortKey = "recent" | "high" | "low";

function StarRow({
  value,
  size = 16,
  interactive = false,
  onSelect,
}: {
  value: number;
  size?: number;
  interactive?: boolean;
  onSelect?: (rating: number) => void;
}) {
  return (
    <span className="pdp-reviews__stars" aria-hidden={!interactive}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value >= star;
        const half = !filled && value >= star - 0.5;
        const icon = (
          <Star
            size={size}
            className={`pdp-reviews__star${filled ? " is-filled" : ""}${
              half ? " is-half" : ""
            }`}
          />
        );
        if (!interactive) return <span key={star}>{icon}</span>;
        return (
          <button
            key={star}
            type="button"
            className="pdp-reviews__star-btn"
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            onClick={() => onSelect?.(star)}
          >
            {icon}
          </button>
        );
      })}
    </span>
  );
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default function ReviewSection({
  productId,
  reviews = [],
}: ReviewSectionProps) {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectUserAuth);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("recent");
  const [formOpen, setFormOpen] = useState(false);
  const [draftRating, setDraftRating] = useState(0);
  const [draftComment, setDraftComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = reviews.length;
  const average = useMemo(() => {
    if (!total) return 0;
    const sum = reviews.reduce((acc, review) => acc + Number(review.rating || 0), 0);
    return Math.round((sum / total) * 10) / 10;
  }, [reviews, total]);

  const distribution = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const review of reviews) {
      const star = Math.min(5, Math.max(1, Math.round(Number(review.rating) || 0)));
      counts[star] += 1;
    }
    return STAR_FILTERS.map((star) => ({
      star,
      count: counts[star],
      percent: total ? Math.round((counts[star] / total) * 100) : 0,
    }));
  }, [reviews, total]);

  const visibleReviews = useMemo(() => {
    const filtered = starFilter
      ? reviews.filter((review) => Math.round(Number(review.rating) || 0) === starFilter)
      : [...reviews];

    filtered.sort((a, b) => {
      if (sortBy === "high") return Number(b.rating) - Number(a.rating);
      if (sortBy === "low") return Number(a.rating) - Number(b.rating);
      const aTime = new Date(a.createdAt || a.date).getTime() || 0;
      const bTime = new Date(b.createdAt || b.date).getTime() || 0;
      return bTime - aTime;
    });
    return filtered;
  }, [reviews, starFilter, sortBy]);

  const openForm = (rating = 0) => {
    if (!auth.isAuthenticated) {
      dispatch(setAuthModalOpen(true));
      return;
    }
    setDraftRating(rating || draftRating || 5);
    setFormOpen(true);
  };

  const submitReview = async () => {
    if (!auth.user?.id) {
      dispatch(setAuthModalOpen(true));
      return;
    }
    if (draftRating < 1) {
      toast.error("Please select a star rating.");
      return;
    }
    if (stripHtml(draftComment).length < 10) {
      toast.error("Please write at least 10 characters.");
      return;
    }

    try {
      setSubmitting(true);
      const response = (await postData(API_ENDPOINTS.CUSTOMER.REVIEWS, {
        productId,
        userId: Number(auth.user.id),
        rating: draftRating,
        comment: draftComment.trim(),
      })) as { success?: boolean; message?: string };
      if (!response?.success) {
        toast.error(response?.message || "Could not submit review.");
        return;
      }
      toast.success(
        response.message || "Thank you. Your review will appear after approval."
      );
      setFormOpen(false);
      setDraftComment("");
      setDraftRating(0);
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: string }).message)
          : "Could not submit review.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="pdp-reviews" aria-labelledby="pdp-reviews-title">
      <header className="pdp-reviews__top">
        <h2 id="pdp-reviews-title" className="pdp-reviews__title">
          Customer Reviews
        </h2>
        <p className="pdp-reviews__subtitle">
          See what our customers are saying about this product.
        </p>
      </header>

      <div className="pdp-reviews__layout">
        <aside className="pdp-reviews__summary">
          <div className="pdp-reviews__card pdp-reviews__overview">
            <p className="pdp-reviews__average">{average.toFixed(1)}</p>
            <StarRow value={average} size={20} />
            <p className="pdp-reviews__based">
              Based on {total} review{total === 1 ? "" : "s"}
            </p>
            <ul className="pdp-reviews__bars">
              {distribution.map((row) => (
                <li key={row.star}>
                  <span>{row.star} Stars</span>
                  <span className="pdp-reviews__bar" aria-hidden>
                    <span style={{ width: `${row.percent}%` }} />
                  </span>
                  <span>
                    {row.percent}% ({row.count})
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pdp-reviews__card pdp-reviews__verified">
            <ShieldCheck size={22} />
            <p>
              <strong>Verified Purchase:</strong> All reviews are from verified
              customers who purchased this product.
            </p>
          </div>

          <div className="pdp-reviews__cta">
            <h3>Review this product</h3>
            <p>Share your thoughts with other customers.</p>
            <StarRow value={draftRating} size={28} interactive onSelect={openForm} />
          </div>
        </aside>

        <div className="pdp-reviews__feed">
          <div className="pdp-reviews__toolbar">
            <div className="pdp-reviews__pills">
              <button
                type="button"
                className={`pdp-reviews__pill${!starFilter ? " is-active" : ""}`}
                onClick={() => setStarFilter(null)}
              >
                All Reviews ({total})
              </button>
              {distribution.map((row) => (
                <button
                  key={row.star}
                  type="button"
                  className={`pdp-reviews__pill${
                    starFilter === row.star ? " is-active" : ""
                  }`}
                  onClick={() =>
                    setStarFilter(starFilter === row.star ? null : row.star)
                  }
                >
                  {row.star} Star{row.star === 1 ? "" : "s"} ({row.count})
                </button>
              ))}
            </div>
            <label className="pdp-reviews__sort">
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortKey)}
                aria-label="Sort reviews"
              >
                <option value="recent">Most Recent</option>
                <option value="high">Highest Rated</option>
                <option value="low">Lowest Rated</option>
              </select>
              <ChevronDown size={16} aria-hidden />
            </label>
          </div>

          {formOpen && (
            <form
              className="pdp-reviews__form"
              onSubmit={(event) => {
                event.preventDefault();
                void submitReview();
              }}
            >
              <h3>Write a Review</h3>
              <p>Select a rating and share your experience.</p>
              <StarRow
                value={draftRating}
                size={28}
                interactive
                onSelect={setDraftRating}
              />
              <textarea
                value={draftComment}
                onChange={(event) => setDraftComment(event.target.value)}
                rows={5}
                placeholder="What did you like or dislike?"
                required
              />
              <div className="pdp-reviews__form-actions">
                <button type="button" className="pdp-reviews__cancel" onClick={() => setFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="pdp-reviews__write-btn" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Review"}
                </button>
              </div>
            </form>
          )}

          {visibleReviews.length === 0 ? (
            <p className="pdp-reviews__empty">
              {total === 0
                ? "No reviews yet. Be the first to share your thoughts."
                : "No reviews match this filter."}
            </p>
          ) : (
            <ul className="pdp-reviews__list">
              {visibleReviews.map((review) => {
                const plain = stripHtml(review.comment);
                return (
                  <li key={review.id} className="pdp-reviews__item">
                    <div className="pdp-reviews__item-head">
                      <div>
                        <StarRow value={Number(review.rating) || 0} size={15} />
                        <div className="pdp-reviews__author">
                          <strong>{review.userName}</strong>
                          {review.verified ? (
                            <span className="pdp-reviews__badge">
                              <CheckCircle2 size={14} />
                              Verified Purchase
                            </span>
                          ) : (
                            <span className="pdp-reviews__badge is-muted">
                              <BadgeCheck size={14} />
                              Customer
                            </span>
                          )}
                        </div>
                      </div>
                      <time className="pdp-reviews__date">{review.date}</time>
                    </div>
                    {review.comment.includes("<") ? (
                      <div
                        className="pdp-reviews__body rich-html"
                        dangerouslySetInnerHTML={{ __html: review.comment }}
                      />
                    ) : (
                      <p className="pdp-reviews__body">{plain}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
