import { ShoppingCart, Star } from "lucide-react";

export interface ComboProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
}

export function ComboProductCard({ combo }: { combo: ComboProduct }) {
  const hasDiscount =
    typeof combo.originalPrice === "number" &&
    combo.originalPrice > combo.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((combo.originalPrice! - combo.price) / combo.originalPrice!) * 100
      )
    : 0;

  return (
    <article className="combo-card">
      <div className="combo-card-image-wrap">
        <img src={combo.image} alt={combo.name} className="combo-card-image" />
        <span className="combo-badge">Combo Offer</span>
        {hasDiscount && (
          <span className="combo-discount">Save {discountPercent}%</span>
        )}
        <div className="combo-add-to-cart-container">
          <button className="combo-btn" type="button" disabled={!combo.inStock}>
            <ShoppingCart size={20} strokeWidth={2.2} />
            <span>{combo.inStock ? "Add Combo" : "Out Stock"}</span>
          </button>
        </div>
      </div>
      <div className="combo-card-content">
        <p className="combo-card-category">{combo.category}</p>
        <h3 className="combo-card-title">{combo.name}</h3>
        <div className="combo-rating-row">
          <div className="combo-stars">
            {[...Array(5)].map((_, index) => (
              <Star key={index} size={16} className="combo-star" fill="currentColor" />
            ))}
          </div>
          <span className="combo-review-count">({combo.reviewCount ?? 0})</span>
        </div>
        <div className="combo-card-footer">
          <div className="combo-price-wrap">
            <span className="combo-price">Rs.{combo.price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="combo-original-price">
                Rs.{combo.originalPrice?.toFixed(2)}
              </span>
            )}
          </div>
          {hasDiscount && (
            <span className="combo-off-pill">{discountPercent}% OFF</span>
          )}
        </div>
      </div>
    </article>
  );
}
