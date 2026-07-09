"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart, PackageCheck, ShoppingCart, Sparkles, Star } from "lucide-react";
import ProductImageGallery from "@/components/website/product/ProductImageGallery";
import type { ProductVariantView } from "@/components/website/product/productApi";
import {
  buildAttributeGroups,
  buildSpecRows,
  findVariantBySelections,
  getCompatibleVariantIds,
  resolveAttributeSelections,
  selectionsFromVariant,
  type AttributeSelectionGroup,
  type VariantAttributeOption,
} from "@/components/website/product/productVariantUtils";
import { fetchWebsiteCart } from "@/services/redux/slices/websiteSlices/cartSlice";
import { addOrUpdateCartItem } from "@/services/website/cartService";
import type { RootState } from "@/services/redux";
import { setAuthModalOpen } from "@/services/redux/slices/websiteSlices/modalSlice";
import { usePathname, useRouter } from "next/navigation";
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
  fallbackImages?: string[];
};

function getPreferredVariant(
  variants: ProductVariantView[],
  preferredVariantId?: number | null
): ProductVariantView | null {
  if (!variants.length) return null;

  if (preferredVariantId) {
    const matched = variants.find((variant) => variant.id === preferredVariantId);
    if (matched) return matched;
  }

  return variants[0] || null;
}

function toCurrency(value: number | null | undefined): string | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return `Rs. ${value.toFixed(2)}`;
}

function getOfferSummary(offer: {
  offerName: string;
  discountType: string;
  discountValue: number;
  discountAmount?: number;
  discountPercentage?: number;
}): string {
  if (typeof offer.discountAmount === "number" && offer.discountAmount > 0) {
    return `${offer.offerName}: Save ${toCurrency(offer.discountAmount)} (${offer.discountPercentage?.toFixed(0) || 0}% off)`;
  }

  if (offer.discountType === "fixed") {
    return `${offer.offerName}: Save ${toCurrency(offer.discountValue)}`;
  }

  return `${offer.offerName}: ${offer.discountValue}% off`;
}

function AttributeOptionButton({
  option,
  isSelected,
  isDisabled,
  onSelect,
}: {
  option: VariantAttributeOption;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}) {
  const isVisual = option.viewOption === "code" || option.viewOption === "image";

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isDisabled}
      aria-pressed={isSelected}
      aria-label={option.label}
      title={option.label}
      className={[
        "product-variation-option",
        isSelected ? "is-selected" : "",
        isDisabled ? "is-disabled" : "",
        isVisual ? "product-variation-option--visual" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {option.viewOption === "code" && option.code ? (
        <span
          className="product-variation-option__swatch"
          style={{ backgroundColor: option.code }}
          aria-hidden="true"
        />
      ) : option.viewOption === "image" && option.image ? (
        <span className="product-variation-option__image-wrap">
          <Image
            src={option.image}
            alt=""
            width={44}
            height={44}
            className="product-variation-option__image"
          />
        </span>
      ) : (
        <span className="product-variation-option__label">{option.label}</span>
      )}
    </button>
  );
}

export default function ProductDetail({ product, fallbackImages = [] }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.userAuth.isAuthenticated);

  const attributeGroups = useMemo(
    () => buildAttributeGroups(product.variants),
    [product.variants]
  );
  const useAttributePicker = attributeGroups.length > 0;

  const preferredVariant = getPreferredVariant(product.variants, product.selectedVariantId);

  const [attributeSelections, setAttributeSelections] = useState<Record<number, string>>(() =>
    selectionsFromVariant(preferredVariant)
  );
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    preferredVariant?.id ?? null
  );
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(
    preferredVariant?.appliedOffer?.id ?? null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [hasUserSelectedVariant, setHasUserSelectedVariant] = useState(false);

  useEffect(() => {
    const nextPreferred = getPreferredVariant(product.variants, product.selectedVariantId);
    setAttributeSelections(selectionsFromVariant(nextPreferred));
    setSelectedVariantId(nextPreferred?.id ?? null);
    setSelectedOfferId(nextPreferred?.appliedOffer?.id ?? null);
    setHasUserSelectedVariant(false);
    setQuantity(1);
  }, [product.id, product.selectedVariantId, product.variants]);

  const selectedVariant = useMemo(() => {
    if (useAttributePicker) {
      return (
        findVariantBySelections(product.variants, attributeSelections, attributeGroups) ??
        product.variants.find((variant) => variant.id === selectedVariantId) ??
        getPreferredVariant(product.variants, product.selectedVariantId)
      );
    }

    return (
      product.variants.find((variant) => variant.id === selectedVariantId) ??
      getPreferredVariant(product.variants, product.selectedVariantId)
    );
  }, [
    attributeGroups,
    attributeSelections,
    product.selectedVariantId,
    product.variants,
    selectedVariantId,
    useAttributePicker,
  ]);

  useEffect(() => {
    if (!selectedVariant) {
      setSelectedOfferId(null);
      return;
    }

    if (selectedVariant.id !== selectedVariantId) {
      setSelectedVariantId(selectedVariant.id);
    }

    const hasSelectedOffer = selectedOfferId
      ? selectedVariant.offerPrices.some((offerPrice) => offerPrice.offerId === selectedOfferId)
      : false;

    if (!hasSelectedOffer) {
      setSelectedOfferId(selectedVariant.appliedOffer?.id ?? null);
    }
  }, [selectedVariant, selectedOfferId, selectedVariantId]);

  useEffect(() => {
    if (!hasUserSelectedVariant || !selectedVariant?.slug) {
      return;
    }

    const currentSlug = pathname?.split("/").filter(Boolean).pop();
    if (currentSlug && currentSlug !== selectedVariant.slug) {
      router.replace(`/product/${selectedVariant.slug}`, { scroll: false });
    }
  }, [hasUserSelectedVariant, pathname, router, selectedVariant]);

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

  const handleAttributeSelect = (group: AttributeSelectionGroup, value: string) => {
    setHasUserSelectedVariant(true);
    const nextSelections = resolveAttributeSelections(product.variants, attributeGroups, {
      ...attributeSelections,
      [group.attributeId]: value,
    });
    setAttributeSelections(nextSelections);

    const matchedVariant = findVariantBySelections(
      product.variants,
      nextSelections,
      attributeGroups
    );
    if (matchedVariant) {
      setSelectedVariantId(matchedVariant.id);
    }
  };

  const handleSimpleVariantSelect = (variantId: number) => {
    setHasUserSelectedVariant(true);
    setSelectedVariantId(variantId);
    const variant = product.variants.find((item) => item.id === variantId);
    setAttributeSelections(selectionsFromVariant(variant));
  };

  const selectedOfferPricing =
    selectedOfferId && selectedVariant
      ? selectedVariant.offerPrices.find((offerPrice) => offerPrice.offerId === selectedOfferId) ||
        null
      : null;
  const selectedPrice =
    selectedOfferPricing?.finalPrice ?? selectedVariant?.finalPrice ?? selectedVariant?.price ?? null;
  const selectedOriginalPrice =
    selectedOfferPricing?.originalPrice ??
    selectedVariant?.originalPrice ??
    selectedVariant?.price ??
    null;
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
  const showSimpleVariantPicker = !useAttributePicker && product.variants.length > 1;
  const specRows = buildSpecRows(selectedVariant, product.attributes);
  const compatibleVariantIds = getCompatibleVariantIds(product.variants, attributeSelections);

  return (
    <div className="product-detail-grid">
      <div className="product-detail-image">
        <ProductImageGallery images={displayImages} alt={product.title} />
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

        <h1 className="section-title product-detail-title">{product.title}</h1>

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

        {product.shortDescription && (
          <p className="product-detail-subtitle">{product.shortDescription}</p>
        )}

        <div className="product-price-panel">
          <div className="product-price-stack">
            <span className="product-price-main">
              {toCurrency(selectedPrice) || "Price on request"}
            </span>
            {selectedOriginalPrice !== null &&
              selectedPrice !== null &&
              selectedOriginalPrice > selectedPrice && (
                <span className="product-price-strike">{toCurrency(selectedOriginalPrice)}</span>
              )}
          </div>

          <div className={`product-stock-pill ${inStock ? "is-in-stock" : "is-out-of-stock"}`}>
            {inStock ? `In Stock${selectedStock ? ` • ${selectedStock} left` : ""}` : "Out of stock"}
          </div>
        </div>

        {selectedVariant?.sku && (
          <p className="product-detail-sku">SKU: {selectedVariant.sku}</p>
        )}

        {selectedVariant?.offerPrices && selectedVariant.offerPrices.length > 0 && (
          <div className="product-offer-list">
            {selectedVariant.offerPrices.map((offer) => (
              <button
                key={offer.offerId}
                type="button"
                onClick={() => setSelectedOfferId(offer.offerId)}
                className={`product-offer-pill ${
                  selectedOfferId === offer.offerId ? "is-selected" : ""
                }`}
              >
                <Sparkles size={14} />
                <span>
                  {getOfferSummary(offer)}
                  {offer.sources.length > 0 ? ` • ${offer.sources.join(", ")}` : ""}
                </span>
              </button>
            ))}
          </div>
        )}

        {useAttributePicker && (
          <div className="product-variation-panel">
            <div className="product-variation-head">
              <Sparkles size={15} color="var(--text-saffron)" />
              <h3 className="product-variation-title">Select Options</h3>
            </div>

            <div className="product-variation-groups">
              {attributeGroups.map((group) => {
                const selectedValue = attributeSelections[group.attributeId];

                return (
                  <div key={group.attributeId} className="product-variation-group">
                    <div className="product-variation-group-head">
                      <span className="product-variation-label">{group.name}</span>
                      {selectedValue && (
                        <span className="product-variation-selected">{selectedValue}</span>
                      )}
                    </div>

                    <div className="product-variation-options">
                      {group.options.map((option) => {
                        const isSelected = selectedValue === option.value;
                        const isDisabled = !option.variantIds.some((id) =>
                          compatibleVariantIds.has(id)
                        );

                        return (
                          <AttributeOptionButton
                            key={`${group.attributeId}-${option.value}`}
                            option={option}
                            isSelected={isSelected}
                            isDisabled={isDisabled}
                            onSelect={() => handleAttributeSelect(group, option.value)}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showSimpleVariantPicker && (
          <div className="product-variation-panel">
            <div className="product-variation-head">
              <Sparkles size={15} color="var(--text-saffron)" />
              <h3 className="product-variation-title">Choose Variant</h3>
            </div>

            <div className="product-variation-options">
              {product.variants.map((variant) => {
                const isSelected = selectedVariantId === variant.id;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => handleSimpleVariantSelect(variant.id)}
                    className={`product-variation-option ${isSelected ? "is-selected" : ""}`}
                  >
                    <span className="product-variation-option__label">{variant.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
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
          <button
            className="btn btn-outline btn-lg product-cta-button"
            onClick={handleWishlist}
            aria-label="Add to wishlist"
          >
            <Heart size={20} />
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
