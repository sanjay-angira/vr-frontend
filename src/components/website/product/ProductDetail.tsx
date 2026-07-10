"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart, PackageCheck, ShoppingCart, Star } from "lucide-react";
import ProductImageGallery from "@/components/website/product/ProductImageGallery";
import GroupedVariantPicker from "@/components/website/product/GroupedVariantPicker";
import ProductOfferSelector from "@/components/website/product/ProductOfferSelector";
import type { ProductVariantView } from "@/components/website/product/productApi";
import {
  buildAttributeGroups,
  buildProductVariantUrl,
  buildSpecRows,
  getCheapestVariant,
  resolveInitialVariant,
} from "@/components/website/product/productVariantUtils";
import { fetchWebsiteCart } from "@/services/redux/slices/websiteSlices/cartSlice";
import { addOrUpdateCartItem } from "@/services/website/cartService";
import type { RootState } from "@/services/redux";
import { setAuthModalOpen } from "@/services/redux/slices/websiteSlices/modalSlice";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { isAuthPagePath } from "@/utils/authRoutes";

export type ProductAttributeView = {
  id: number;
  name: string;
  value: string;
};

export type ProductOfferView = {
  id: number;
  offerName: string;
  offerSlug: string;
  discountType: string;
  discountValue: number;
  sources: string[];
};

export type ProductDetailView = {
  id: number;
  title: string;
  slug: string;
  selectedVariantId?: number | null;
  shortDescription: string;
  brandName?: string | null;
  categoryName?: string | null;
  baseImages: string[];
  attributes: ProductAttributeView[];
  variants: ProductVariantView[];
  activeOffers: ProductOfferView[];
  rating: number;
  reviewCount: number;
};

type Props = {
  product: ProductDetailView;
  initialVariantSlug?: string | null;
  fallbackImages?: string[];
};

export default function ProductDetail({
  product,
  initialVariantSlug = null,
  fallbackImages = [],
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.userAuth.isAuthenticated);

  const cheapestVariant = useMemo(
    () => getCheapestVariant(product.variants),
    [product.variants]
  );

  const attributeGroups = useMemo(
    () => buildAttributeGroups(product.variants),
    [product.variants]
  );

  const variantFromUrl = searchParams.get("variant");

  const resolvedInitialVariant = useMemo(
    () =>
      resolveInitialVariant(product.variants, {
        variantSlug: initialVariantSlug ?? variantFromUrl,
      }),
    [product.variants, initialVariantSlug, variantFromUrl]
  );

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    resolvedInitialVariant?.id ?? null
  );
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(
    resolvedInitialVariant?.appliedOffer?.id ?? null
  );
  const [quantity, setQuantity] = useState<number>(1);

  const selectVariant = useCallback(
    (variant: ProductVariantView, updateUrl = true) => {
      setSelectedVariantId(variant.id);
      setSelectedOfferId(variant.appliedOffer?.id ?? null);
      setQuantity(1);

      if (updateUrl && variant.slug) {
        const nextUrl = buildProductVariantUrl(product.slug, variant.slug);
        if (variantFromUrl !== variant.slug) {
          router.replace(nextUrl, { scroll: false });
        }
      }
    },
    [product.slug, router, variantFromUrl]
  );

  useEffect(() => {
    const nextVariant = resolveInitialVariant(product.variants, {
      variantSlug: variantFromUrl ?? initialVariantSlug,
    });

    if (!nextVariant) return;

    setSelectedVariantId(nextVariant.id);
    setSelectedOfferId(nextVariant.appliedOffer?.id ?? null);

    if (nextVariant.slug) {
      const shouldSyncUrl = !variantFromUrl || variantFromUrl !== nextVariant.slug;

      if (shouldSyncUrl) {
        router.replace(buildProductVariantUrl(product.slug, nextVariant.slug), {
          scroll: false,
        });
      }
    }
  }, [product.id, product.slug, product.variants, initialVariantSlug, variantFromUrl, router]);

  const selectedVariant = useMemo(() => {
    if (selectedVariantId) {
      const matched = product.variants.find((variant) => variant.id === selectedVariantId);
      if (matched) return matched;
    }

    return resolvedInitialVariant;
  }, [product.variants, resolvedInitialVariant, selectedVariantId]);

  useEffect(() => {
    if (!selectedVariant) {
      setSelectedOfferId(null);
      return;
    }

    const hasSelectedOffer = selectedOfferId
      ? selectedVariant.offerPrices.some((offerPrice) => offerPrice.offerId === selectedOfferId)
      : false;

    if (!hasSelectedOffer) {
      setSelectedOfferId(selectedVariant.appliedOffer?.id ?? null);
    }
  }, [selectedVariant, selectedOfferId]);

  const handleWishlist = () => {
    if (!isAuthenticated) {
      if (isAuthPagePath(pathname)) return;
      dispatch(setAuthModalOpen(true));
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    try {
      await addOrUpdateCartItem(selectedVariant.id, quantity);
      // @ts-ignore
      dispatch(fetchWebsiteCart());
    } catch (error) {
      console.error("Unable to add product to cart", error);
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
  const specRows = buildSpecRows(selectedVariant, product.attributes);

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

  const wishlistButton = (
    <button
      type="button"
      className="product-gallery__wishlist"
      onClick={handleWishlist}
      aria-label="Add to wishlist"
    >
      <Heart size={20} />
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

        <h1 className="section-title product-detail-title">{displayTitle}</h1>

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

        {selectedVariant?.offerPrices && selectedVariant.offerPrices.length > 0 && (
          <ProductOfferSelector
            offers={selectedVariant.offerPrices}
            selectedOfferId={selectedOfferId}
            onSelectOffer={setSelectedOfferId}
          />
        )}

        {product.variants.length > 1 && (
          <GroupedVariantPicker
            variants={product.variants}
            attributeGroups={attributeGroups}
            selectedVariantId={selectedVariantId}
            cheapestVariant={cheapestVariant}
            onSelectVariant={handleVariantSelect}
          />
        )}

        <div className="product-quantity-block">
          <label className="product-quantity-label">Quantity</label>
          <div className="product-quantity-control">
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
              onChange={(event) => setQuantity(Math.max(1, parseInt(event.target.value, 10) || 1))}
              disabled={!inStock}
              className="product-quantity-input"
              aria-label="Quantity"
            />
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              disabled={!inStock || (selectedVariant?.stock ? quantity >= selectedVariant.stock : false)}
              className="product-quantity-button"
              aria-label="Increase quantity"
            >
              +
            </button>
            <span className="product-quantity-hint">
              {selectedVariant?.stock ? `${selectedVariant.stock} in stock` : "In stock"}
            </span>
          </div>
        </div>

        <div className="product-action-row">
          <button
            className="btn btn-primary btn-lg product-cta-button"
            disabled={!inStock || !selectedVariant}
            onClick={handleAddToCart}
          >
            <ShoppingCart size={18} style={{ marginRight: 8 }} />
            {inStock ? "Add to Cart" : "Unavailable"}
          </button>
          <button
            className="btn btn-outline btn-lg product-cta-button product-cta-button--secondary"
            disabled={!inStock || !selectedVariant}
          >
            <PackageCheck size={18} style={{ marginRight: 8 }} />
            Buy Now
          </button>
        </div>

        {specRows.length > 0 && (
          <div className="product-specs-card">
            <div className="product-specs-card__header">Product Details</div>
            <div className="product-specs-card__body">
              {specRows.map((attribute, index) => (
                <div key={`${attribute.id}-${index}`} className="product-specs-row">
                  <div className="product-specs-row__label">{attribute.name}</div>
                  <div className="product-specs-row__value">{attribute.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
