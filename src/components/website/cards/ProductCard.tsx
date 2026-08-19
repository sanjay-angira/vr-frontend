"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";
import { buildProductVariantUrl } from "@/components/website/product/productVariantUtils";
import { useAppDispatch } from "@/services/redux/hooks";
import {
  addWebsiteCartItem,
  fetchWebsiteCart,
} from "@/services/redux/slices/websiteSlices/cartSlice";
import { useWishlist } from "@/components/website/wishlist/useWishlist";

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
  /** Canonical product slug for /product/[slug] */
  slug?: string;
  /** Optional variant slug → ?variant= deep link */
  variantSlug?: string | null;
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
  isNew?: boolean;
  className?: string;
  href?: string;
}

function resolveCardImage(value: string | { src?: string } | undefined): string {
  const raw = typeof value === "string" ? value : value?.src ?? "";
  return resolveImageUrl(raw.trim()) || "";
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
  isNew,
  className,
  href,
}: ProductCardProps) {
  const dispatch = useAppDispatch();
  const { isWished, toggle } = useWishlist();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const normalizedProduct: WebsiteProductCardData = product
    ? {
        ...product,
        image: resolveCardImage(product.image),
      }
    : {
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
        image: resolveCardImage(image),
        category: category ?? "",
        rating: rating ?? 0,
        reviewCount: reviewCount ?? 0,
        inStock: inStock ?? true,
        isNew,
      };

  const variationId = Number(normalizedProduct.id);
  const wished = isWished(variationId);
  const productHref =
    href ??
    (normalizedProduct.slug
      ? buildProductVariantUrl(
          normalizedProduct.slug,
          normalizedProduct.variantSlug &&
            normalizedProduct.variantSlug !== normalizedProduct.slug
            ? normalizedProduct.variantSlug
            : null,
        )
      : undefined);

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
    [],
  );

  const handleAddToCart = async () => {
    if (!Number.isFinite(variationId) || variationId <= 0) {
      return;
    }

    try {
      setIsAddingToCart(true);
      await dispatch(
        addWebsiteCartItem({ variationId, quantity: 1 }),
      ).unwrap();
      void dispatch(fetchWebsiteCart());
    } catch (error) {
      console.error("Failed to add item to cart", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (wishBusy) return;
    setWishBusy(true);
    try {
      await toggle(variationId);
    } finally {
      setWishBusy(false);
    }
  };

  const imageElement = normalizedProduct.image ? (
    <Image
      src={imageFailed ? "/next.svg" : normalizedProduct.image}
      alt={normalizedProduct.name}
      fill
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      className="product-image"
      onError={() => setImageFailed(true)}
    />
  ) : (
    <div className="product-image product-image--placeholder" aria-hidden />
  );

  return (
    <article className={`product-card ${className || ""}`.trim()}>
      <div className="image-container">
        {productHref ? (
          <Link href={productHref} aria-label={normalizedProduct.name}>
            {imageElement}
          </Link>
        ) : (
          imageElement
        )}

        <div className="badges">
          {hasDiscount ? (
            <span className="badge badge--sale">
              <span className="badge__value">{discountPercentage}%</span>
              <span className="badge__label">OFF</span>
            </span>
          ) : null}
        </div>

        <div className="quick-actions">
          <button
            type="button"
            className={`action-btn ${wished ? "is-wished" : ""}`}
            onClick={() => void handleWishlist()}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wished}
            disabled={wishBusy}
          >
            <Heart fill={wished ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="add-to-cart-container">
          <button
            type="button"
            className="add-to-cart-btn"
            onClick={() => void handleAddToCart()}
            disabled={!normalizedProduct.inStock || isAddingToCart}
          >
            <ShoppingCart />
            <span className="add-to-cart-btn__label add-to-cart-btn__label--full">
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </span>
            <span className="add-to-cart-btn__label add-to-cart-btn__label--short">
              {isAddingToCart ? "…" : "Add"}
            </span>
          </button>
        </div>
      </div>

      <div className="content">
        {normalizedProduct.category ? (
          <div className="category">{normalizedProduct.category}</div>
        ) : null}
        <h3 className="product-name">
          {productHref ? (
            <Link href={productHref}>{normalizedProduct.name}</Link>
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
            {hasDiscount ? (
              <span className="original-price">
                Rs. {priceFormatter.format(listPrice)}
              </span>
            ) : null}
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
    </article>
  );
}
