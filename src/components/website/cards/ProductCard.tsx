"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Eye, Heart, ShoppingCart, Star } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/services/redux/hooks";
import { setAuthModalOpen } from "@/services/redux/slices/websiteSlices/modalSlice";
import {
  addWebsiteCartItem,
  fetchWebsiteCart,
} from "@/services/redux/slices/websiteSlices/cartSlice";
import { isAuthPagePath } from "@/utils/authRoutes";

export interface WebsiteProductCardData {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  slug?: string;
}

export interface ProductCardProps {
  product?: WebsiteProductCardData;
  id?: string;
  title?: string;
  image?: string | { src?: string };
  price?: string | number;
  originalPrice?: string | number;
  rating?: number;
  description?: string;
  category?: string;
  reviewCount?: number;
  inStock?: boolean;
  className?: string;
  href?: string;
}

export function ProductCard({
  product,
  id,
  title,
  image,
  price,
  originalPrice,
  rating,
  description,
  category,
  reviewCount,
  inStock,
  className,
  href,
}: ProductCardProps) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector((state) => state.userAuth.isAuthenticated);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const normalizedProduct: WebsiteProductCardData = product ?? {
    id: id ?? "",
    name: title ?? "",
    description: description ?? "",
    price: typeof price === "number" ? price : Number(price ?? 0),
    originalPrice:
      typeof originalPrice === "number"
        ? originalPrice
        : originalPrice !== undefined
          ? Number(originalPrice)
          : undefined,
    image: typeof image === "string" ? image : image?.src ?? "",
    category: category ?? "",
    rating: rating ?? 0,
    reviewCount: reviewCount ?? 0,
    inStock: inStock ?? true,
  };

  const currentPrice = Number(normalizedProduct.price || 0);
  const listPrice = Number(normalizedProduct.originalPrice || 0);
  const hasDiscount = listPrice > currentPrice && currentPrice > 0;
  const discountPercentage = hasDiscount
    ? Math.round(((listPrice - currentPrice) / listPrice) * 100)
    : 0;

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 0,
      }),
    []
  );

  const handleAddToCart = async () => {
    const variationId = Number(normalizedProduct.id);
    if (!Number.isFinite(variationId) || variationId <= 0) {
      return;
    }

    try {
      setIsAddingToCart(true);
      await dispatch(
        addWebsiteCartItem({ variationId, quantity: 1 })
      ).unwrap();
      void dispatch(fetchWebsiteCart());
    } catch (error) {
      console.error("Failed to add item to cart", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      if (isAuthPagePath(pathname)) {
        return;
      }
      dispatch(setAuthModalOpen(true));
    }
  };

  const imageElement = (
    <img
      src={normalizedProduct.image}
      alt={normalizedProduct.name}
      className="product-image"
      loading="lazy"
      onError={(event) => {
        event.currentTarget.src = "/next.svg";
      }}
    />
  );

  return (
    <div className={`product-card-1 ${className || ""}`}>
      <div className="image-container">
        {href ? (
          <Link href={href} aria-label={normalizedProduct.name}>
            {imageElement}
          </Link>
        ) : (
          imageElement
        )}

        <div className="badges">
          {normalizedProduct.isNew && <span className="badge new">New</span>}
          {hasDiscount && (
            <span className="badge sale">-{discountPercentage}%</span>
          )}
        </div>

        <div className="quick-actions">
          <button
            type="button"
            className="action-btn"
            onClick={handleWishlist}
            aria-label="Add to wishlist"
          >
            <Heart />
          </button>
          {href && (
            <Link href={href} className="action-btn" aria-label="Quick view">
              <Eye />
            </Link>
          )}
        </div>

        <div className="add-to-cart-container">
          <button
            type="button"
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={!normalizedProduct.inStock || isAddingToCart}
          >
            <ShoppingCart />
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>

      <div className="content">
        <div className="category">{normalizedProduct.category}</div>
        <h3 className="product-name">
          {href ? (
            <Link href={href}>{normalizedProduct.name}</Link>
          ) : (
            normalizedProduct.name
          )}
        </h3>

        <div className="rating">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={`star ${
                index < Math.floor(normalizedProduct.rating) ? "filled" : "empty"
              }`}
            />
          ))}
          <span className="review-count">({normalizedProduct.reviewCount})</span>
        </div>

        <div className="price-section">
          <div className="prices">
            <span className="current-price">
              Rs. {priceFormatter.format(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="original-price">
                Rs. {priceFormatter.format(listPrice)}
              </span>
            )}
          </div>
          <div
            className={`stock-status ${
              normalizedProduct.inStock ? "in-stock" : "out-of-stock"
            }`}
          >
            {normalizedProduct.inStock ? "In Stock" : "Out of Stock"}
          </div>
        </div>
      </div>
    </div>
  );
}
