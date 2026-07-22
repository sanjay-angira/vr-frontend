"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Heart, Star } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/services/redux/hooks";
import { setAuthModalOpen } from "@/services/redux/slices/websiteSlices/modalSlice";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";

export type StoreListProduct = {
  id: number;
  productId: number;
  variantId: number;
  productSlug: string | null;
  productName: string;
  image: string | null;
  originalPrice: number | null;
  finalPrice: number | null;
  discountPercentage?: number;
  rating?: number;
  inStock?: boolean;
  stock?: number;
  isNew?: boolean;
};

type StoreProductCardProps = {
  product: StoreListProduct;
};

export function StoreProductCard({ product }: StoreProductCardProps) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.userAuth.isAuthenticated);
  const [wishlistPulse, setWishlistPulse] = useState(false);

  const finalPrice = Number(product.finalPrice || 0);
  const originalPrice = Number(product.originalPrice || 0);
  const hasDiscount = originalPrice > finalPrice && finalPrice > 0;
  const discountPct =
    product.discountPercentage && product.discountPercentage > 0
      ? Math.round(product.discountPercentage)
      : hasDiscount
        ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
        : 0;

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 0,
      }),
    []
  );

  const href = product.productSlug ? `/product/${product.productSlug}` : undefined;
  const image = resolveImageUrl(product.image || "") || "/next.svg";
  const rating = Number(product.rating || 0);

  const handleWishlist = () => {
    setWishlistPulse(true);
    window.setTimeout(() => setWishlistPulse(false), 280);
    if (!isAuthenticated) {
      dispatch(setAuthModalOpen(true));
    }
  };

  const imageNode = (
    <img
      src={image}
      alt={product.productName}
      className="store-card__image"
      loading="lazy"
      onError={(event) => {
        event.currentTarget.src = "/next.svg";
      }}
    />
  );

  return (
    <article className="store-card">
      <div className="store-card__media">
        {href ? (
          <Link href={href} aria-label={product.productName}>
            {imageNode}
          </Link>
        ) : (
          imageNode
        )}

        <div className="store-card__badges">
          {discountPct > 0 && (
            <span className="store-card__discount">{discountPct}% OFF</span>
          )}
          {product.isNew && <span className="store-card__new">New</span>}
        </div>

        <button
          type="button"
          className={`store-card__wish ${wishlistPulse ? "is-pulse" : ""}`}
          onClick={handleWishlist}
          aria-label="Add to wishlist"
        >
          <Heart size={16} />
        </button>
      </div>

      <div className="store-card__body">
        <h3 className="store-card__title">
          {href ? <Link href={href}>{product.productName}</Link> : product.productName}
        </h3>

        <div className="store-card__meta">
          <div className="store-card__pricing">
            <span className="store-card__from">From</span>
            <span className="store-card__price">
              ₹{priceFormatter.format(finalPrice)}
            </span>
            {hasDiscount && (
              <span className="store-card__mrp">
                ₹{priceFormatter.format(originalPrice)}
              </span>
            )}
          </div>

          {rating > 0 && (
            <div className="store-card__rating">
              <Star size={14} fill="currentColor" />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
