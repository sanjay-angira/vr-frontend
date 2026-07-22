"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Heart,
  Leaf,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import ProductImageGallery from "@/components/website/product/ProductImageGallery";
import GroupedVariantPicker from "@/components/website/product/GroupedVariantPicker";
import ProductPriceBlock from "@/components/website/product/ProductPriceBlock";
import type { ProductVariantView } from "@/components/website/product/productApi";
import {
  buildAttributeGroups,
  findVariantBySlug,
  hasVariantOptionGroups,
  replaceProductVariantInUrl,
  resolveInitialVariant,
} from "@/components/website/product/productVariantUtils";
import { fetchWebsiteCart } from "@/services/redux/slices/websiteSlices/cartSlice";
import { addOrUpdateCartItem } from "@/services/website/cartService";
import type { RootState } from "@/services/redux";
import { setAuthModalOpen } from "@/services/redux/slices/websiteSlices/modalSlice";
import { useRouter } from "next/navigation";

export type ProductAttributeView = {
  id: number;
  name: string;
  value: string;
};

export type ProductDetailView = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  brandName?: string | null;
  categoryName?: string | null;
  baseImages: string[];
  attributes: ProductAttributeView[];
  variants: ProductVariantView[];
  rating: number;
  reviewCount: number;
};

type Props = {
  product: ProductDetailView;
  fallbackImages?: string[];
  initialVariantSlug?: string | null;
};

function getVariantSlugFromWindow(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("variant");
}

export default function ProductDetail({
  product,
  fallbackImages = [],
  initialVariantSlug = null,
}: Props) {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.userAuth.isAuthenticated);

  const attributeGroups = useMemo(
    () => buildAttributeGroups(product.variants),
    [product.variants]
  );

  const showVariantPicker = useMemo(
    () => hasVariantOptionGroups(product.variants),
    [product.variants]
  );

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(() => {
    const initial = resolveInitialVariant(product.variants, {
      variantSlug: getVariantSlugFromWindow() ?? initialVariantSlug,
    });
    return initial?.id ?? product.variants[0]?.id ?? null;
  });
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedFlash, setAddedFlash] = useState(false);

  const selectVariant = useCallback(
    (variant: ProductVariantView) => {
      setSelectedVariantId(variant.id);
      setQuantity(1);

      if (variant.slug) {
        replaceProductVariantInUrl(product.slug, variant.slug);
      }
    },
    [product.slug]
  );

  useEffect(() => {
    const variant =
      product.variants.find((item) => item.id === selectedVariantId) ??
      product.variants[0] ??
      null;

    if (!variant?.slug) return;

    const currentSlug = getVariantSlugFromWindow();
    if (currentSlug !== variant.slug) {
      replaceProductVariantInUrl(product.slug, variant.slug);
    }
  }, [product.slug, product.variants, selectedVariantId]);

  useEffect(() => {
    const syncFromUrl = () => {
      const slug = getVariantSlugFromWindow();
      const matched = slug
        ? findVariantBySlug(product.variants, slug)
        : product.variants[0] ?? null;

      if (matched) {
        setSelectedVariantId(matched.id);
      }
    };

    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [product.variants]);

  const selectedVariant = useMemo(() => {
    if (selectedVariantId) {
      const matched = product.variants.find((variant) => variant.id === selectedVariantId);
      if (matched) return matched;
    }

    return product.variants[0] ?? null;
  }, [product.variants, selectedVariantId]);

  const handleWishlist = () => {
    if (!isAuthenticated) {
      dispatch(setAuthModalOpen(true));
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || isAdding) return;

    try {
      setIsAdding(true);
      await addOrUpdateCartItem(selectedVariant.id, quantity);
      // @ts-ignore
      dispatch(fetchWebsiteCart());
      setAddedFlash(true);
      window.setTimeout(() => setAddedFlash(false), 1600);
    } catch (error) {
      console.error("Unable to add product to cart", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant || isAdding) return;

    try {
      setIsAdding(true);
      await addOrUpdateCartItem(selectedVariant.id, quantity);
      // @ts-ignore
      dispatch(fetchWebsiteCart());
      router.push("/checkout");
    } catch (error) {
      console.error("Unable to start checkout", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleVariantSelect = (variant: ProductVariantView) => {
    selectVariant(variant);
  };

  const selectedImages =
    (selectedVariant?.images?.length ? selectedVariant.images : product.baseImages).length > 0
      ? selectedVariant?.images?.length
        ? selectedVariant.images
        : product.baseImages
      : fallbackImages;
  const displayImages = selectedImages.length > 0 ? selectedImages : fallbackImages;
  const selectedStock = selectedVariant?.stock ?? null;
  const inStock =
    typeof selectedStock === "number" ? selectedStock > 0 : product.variants.length === 0;

  const variantDescription = useMemo(() => {
    return selectedVariant?.description?.trim() || "";
  }, [selectedVariant?.description]);

  const displayTitle = useMemo(() => {
    const productName = product.title.trim();
    const variantName = selectedVariant?.name?.trim();

    if (!variantName) {
      return productName;
    }

    if (variantName.toLowerCase() === productName.toLowerCase()) {
      return productName;
    }

    return `${productName} ${variantName}`;
  }, [product.title, selectedVariant?.name]);

  const shortCopy = product.shortDescription
    ?.replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "";

  const wishlistButton = (
    <button
      type="button"
      className="product-gallery__wishlist"
      onClick={handleWishlist}
      aria-label="Add to wishlist"
    >
      <Heart size={18} />
    </button>
  );

  return (
    <div className="product-detail-grid">
      <div className="product-detail-image">
        <ProductImageGallery
          images={displayImages}
          alt={displayTitle}
          topRightSlot={wishlistButton}
        />
      </div>

      <div className="product-detail-content product-detail-panel">
        <div className="product-detail-meta-chips">
          {product.categoryName && (
            <span className="product-detail-chip product-detail-chip--olive">
              {product.categoryName}
            </span>
          )}
          {product.brandName && (
            <span className="product-detail-chip product-detail-chip--saffron">
              {product.brandName}
            </span>
          )}
        </div>

        <h1 className="product-detail-title">{displayTitle}</h1>

        {(product.rating > 0 || product.reviewCount > 0) && (
          <div className="product-detail-rating-row">
            <div className="product-detail-stars" aria-label={`Rated ${product.rating} out of 5`}>
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  size={14}
                  className={
                    index < Math.round(product.rating)
                      ? "product-detail-star active"
                      : "product-detail-star"
                  }
                  fill={index < Math.round(product.rating) ? "currentColor" : "none"}
                />
              ))}
            </div>
            {product.rating > 0 && (
              <span className="product-detail-rating-value">{product.rating.toFixed(1)}</span>
            )}
            {product.reviewCount > 0 && (
              <span className="product-detail-rating-count">({product.reviewCount} reviews)</span>
            )}
          </div>
        )}

        {shortCopy && <p className="product-detail-subtitle">{shortCopy}</p>}

        {selectedVariant && (
          <ProductPriceBlock pricing={selectedVariant.pricing} inStock={inStock} />
        )}

        {showVariantPicker && (
          <GroupedVariantPicker
            variants={product.variants}
            attributeGroups={attributeGroups}
            selectedVariantId={selectedVariantId}
            onSelectVariant={handleVariantSelect}
          />
        )}

        <div className="product-quantity-block">
          <label className="product-quantity-label">Quantity</label>
          <div className="product-quantity-control">
            <div className="product-quantity-stepper">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || !inStock}
                className="product-quantity-button"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max={selectedVariant?.stock ?? 100}
                value={quantity}
                onChange={(event) =>
                  setQuantity(Math.max(1, parseInt(event.target.value, 10) || 1))
                }
                disabled={!inStock}
                className="product-quantity-input"
                aria-label="Quantity"
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                disabled={
                  !inStock ||
                  (selectedVariant?.stock ? quantity >= selectedVariant.stock : false)
                }
                className="product-quantity-button"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <span className="product-quantity-hint">
              {selectedVariant?.stock ? `${selectedVariant.stock} in stock` : "In stock"}
            </span>
          </div>
        </div>

        <div className="product-action-row">
          <button
            type="button"
            className={`btn btn-primary btn-lg product-cta-button${
              addedFlash ? " is-added" : ""
            }`}
            disabled={!inStock || !selectedVariant || isAdding}
            onClick={handleAddToCart}
          >
            <ShoppingCart size={18} aria-hidden="true" />
            {isAdding ? "Adding…" : addedFlash ? "Added to Cart" : inStock ? "Add to Cart" : "Unavailable"}
          </button>
          <button
            type="button"
            className="btn btn-outline btn-lg product-cta-button product-cta-button--secondary"
            disabled={!inStock || !selectedVariant || isAdding}
            onClick={handleBuyNow}
          >
            <PackageCheck size={18} aria-hidden="true" />
            Buy Now
          </button>
        </div>

        <ul className="product-trust-row" aria-label="Purchase benefits">
          <li>
            <Truck size={16} aria-hidden="true" />
            <span>Fast dispatch</span>
          </li>
          <li>
            <ShieldCheck size={16} aria-hidden="true" />
            <span>Secure checkout</span>
          </li>
          <li>
            <Leaf size={16} aria-hidden="true" />
            <span>Curated quality</span>
          </li>
        </ul>

        {variantDescription && (
          <div className="product-specs-card product-description-card">
            <div className="product-specs-card__header">Variant details</div>
            <div
              className="product-copy-content product-description-card__body rich-html"
              dangerouslySetInnerHTML={{ __html: variantDescription }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
