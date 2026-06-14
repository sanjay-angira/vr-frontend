"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Heart, PackageCheck, ShoppingCart, Sparkles, Star } from "lucide-react";
import ProductImageGallery from "@/components/utilis/ProductImageGallery";
import { fetchCart } from '@/services/redux/slices/cartSlice';
import { addOrUpdateCartItem } from '@/services/api/cartService';
import { RootState } from '@/services/redux/store';
import { toggleModal } from '@/services/redux/slices/modalSlice';
import { usePathname, useRouter } from "next/navigation";

export type ProductAttributeView = {
  id: number;
  name: string;
  type?: string;
  value: string;
  isRequired?: boolean;
  isFilterable?: boolean;
};

export type ProductVariantAttributeView = {
  attributeId: number;
  name: string;
  type?: string;
  value: string;
};

export type ProductVariantView = {
  id: number;
  slug?: string | null;
  name: string;
  price: number | null;
  originalPrice: number | null;
  finalPrice: number | null;
  discountAmount: number;
  discountPercentage: number;
  appliedOffer?: {
    id: number;
    offerName: string;
    offerSlug: string;
    type: string;
    discountValue: number;
  } | null;
  stock: number | null;
  sku: string | null;
  images: string[];
  attributes: ProductVariantAttributeView[];
  offerPrices: Array<{
    offerId: number;
    offerName: string;
    offerSlug: string;
    type: string;
    discountValue: number;
    originalPrice: number | null;
    finalPrice: number | null;
    discountAmount: number;
    discountPercentage: number;
    sources: string[];
  }>;
};

export type ProductOfferView = {
  id: number;
  offerName: string;
  offerSlug: string;
  type: string;
  discountValue: number;
  sources: string[];
};

export type ProductDetailView = {
  id: number;
  title: string;
  slug: string;
  selectedVariantId?: number | null;
  shortDescription: string;
  descriptionHtml: string;
  brandName?: string | null;
  categoryName?: string | null;
  productType?: string | null;
  baseImages: string[];
  attributes: ProductAttributeView[];
  variants: ProductVariantView[];
  activeOffers: ProductOfferView[];
  rating: number;
  reviewCount: number;
};

type VariationGroup = {
  attributeId: number;
  name: string;
  type?: string;
  values: string[];
};

type CombinationOption = {
  key: string;
  label: string;
  variant: ProductVariantView;
};

type Props = {
  product: ProductDetailView;
  fallbackImages?: string[];
};

function getPreferredVariant(
  variants: ProductVariantView[],
  preferredVariantId?: number | null
): ProductVariantView | null {
  if (!variants.length) {
    return null;
  }

  if (preferredVariantId) {
    const matchedVariant = variants.find((variant) => variant.id === preferredVariantId);
    if (matchedVariant) {
      return matchedVariant;
    }
  }

  return variants[0] || null;
}

function buildVariationGroups(variants: ProductVariantView[]): VariationGroup[] {
  const groups = new Map<number, VariationGroup>();

  variants.forEach((variant) => {
    variant.attributes.forEach((attribute) => {
      const existing = groups.get(attribute.attributeId);
      if (!existing) {
        groups.set(attribute.attributeId, {
          attributeId: attribute.attributeId,
          name: attribute.name,
          type: attribute.type,
          values: attribute.value ? [attribute.value] : [],
        });
        return;
      }

      if (attribute.value && !existing.values.includes(attribute.value)) {
        existing.values.push(attribute.value);
      }
    });
  });

  return Array.from(groups.values());
}

function isColorGroup(group: VariationGroup): boolean {
  const normalizedName = group.name.trim().toLowerCase();
  return normalizedName === "color" || normalizedName === "colour" || normalizedName.includes("color") || normalizedName.includes("colour");
}

function getVariantAttributeValue(
  variant: ProductVariantView,
  attributeId: number
): string {
  return (
    variant.attributes.find((attribute) => attribute.attributeId === attributeId)?.value || ""
  );
}

function buildCombinationLabel(
  variant: ProductVariantView,
  groups: VariationGroup[]
): string {
  const parts = groups
    .map((group) => {
      const value = getVariantAttributeValue(variant, group.attributeId);
      return value ? `${value} ${group.name}` : null;
    })
    .filter(Boolean);

  return parts.join(" / ") || variant.name;
}

function buildCombinationOptions(
  variants: ProductVariantView[],
  groups: VariationGroup[]
): CombinationOption[] {
  const uniqueCombinations = new Map<string, CombinationOption>();

  variants.forEach((variant) => {
    const key = groups
      .map((group) => getVariantAttributeValue(variant, group.attributeId))
      .join("||");

    if (!key || uniqueCombinations.has(key)) {
      return;
    }

    uniqueCombinations.set(key, {
      key,
      label: buildCombinationLabel(variant, groups),
      variant,
    });
  });

  return Array.from(uniqueCombinations.values());
}

function buildCombinationOptionsByColor(
  variants: ProductVariantView[],
  colorGroup: VariationGroup | null,
  groups: VariationGroup[]
): Record<string, CombinationOption[]> {
  if (!colorGroup) {
    return {};
  }

  return colorGroup.values.reduce<Record<string, CombinationOption[]>>((result, colorValue) => {
    const variantsForColor = variants.filter(
      (variant) => getVariantAttributeValue(variant, colorGroup.attributeId) === colorValue
    );

    result[colorValue] = buildCombinationOptions(variantsForColor, groups);
    return result;
  }, {});
}

function buildInitialSelection(
  groups: VariationGroup[],
  variants: ProductVariantView[],
  preferredVariantId?: number | null
): Record<number, string> {
  const preferredVariant =
    (preferredVariantId
      ? variants.find((variant) => variant.id === preferredVariantId)
      : null) || null;
  const firstVariantWithAttributes =
    preferredVariant && preferredVariant.attributes.length > 0
      ? preferredVariant
      : variants.find((variant) => variant.attributes.length > 0);
  const selection: Record<number, string> = {};

  groups.forEach((group) => {
    const variantValue = firstVariantWithAttributes?.attributes.find(
      (attribute) => attribute.attributeId === group.attributeId
    )?.value;

    selection[group.attributeId] = variantValue || group.values[0] || "";
  });

  return selection;
}

function buildSelectionFromVariant(
  variant: ProductVariantView | null,
  groups: VariationGroup[],
  fallbackSelection: Record<number, string> = {}
): Record<number, string> {
  if (!variant) {
    return fallbackSelection;
  }

  const selection = { ...fallbackSelection };

  groups.forEach((group) => {
    const variantValue = variant.attributes.find(
      (attribute) => attribute.attributeId === group.attributeId
    )?.value;

    if (variantValue) {
      selection[group.attributeId] = variantValue;
    }
  });

  return selection;
}

function variantMatchesSelection(
  variant: ProductVariantView,
  selection: Record<number, string>,
  groups: VariationGroup[]
): boolean {
  return groups.every((group) => {
    const selectedValue = selection[group.attributeId];
    if (!selectedValue) {
      return true;
    }

    const variantValue = variant.attributes.find(
      (attribute) => attribute.attributeId === group.attributeId
    )?.value;

    return variantValue === selectedValue;
  });
}

function getCompatibleVariant(
  variants: ProductVariantView[],
  selection: Record<number, string>,
  groups: VariationGroup[]
): ProductVariantView | null {
  return variants.find((variant) => variantMatchesSelection(variant, selection, groups)) || null;
}

function toCurrency(value: number | null | undefined): string | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return `Rs. ${value.toFixed(2)}`;
}

function getOfferSummary(offer: {
  offerName: string;
  type: string;
  discountValue: number;
  discountAmount?: number;
  discountPercentage?: number;
}): string {
  if (typeof offer.discountAmount === "number" && offer.discountAmount > 0) {
    return `${offer.offerName}: Save ${toCurrency(offer.discountAmount)} (${offer.discountPercentage?.toFixed(0) || 0}% off)`;
  }

  if (offer.type === "fixed") {
    return `${offer.offerName}: Save ${toCurrency(offer.discountValue)}`;
  }

  return `${offer.offerName}: ${offer.discountValue}% off`;
}

export default function ProductDetail({ product, fallbackImages = [] }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const canonicalVariants = [...product.variants].sort((left, right) => left.id - right.id);
  const variationGroups = buildVariationGroups(canonicalVariants);
  const colorGroup = variationGroups.find((group) => isColorGroup(group)) || null;
  const nonColorGroups = colorGroup
    ? variationGroups.filter((group) => group.attributeId !== colorGroup.attributeId)
    : [];
  const preferredVariant = getPreferredVariant(product.variants, product.selectedVariantId);
  const highlightTags = product.attributes
    .map((attribute) => attribute.value || attribute.name)
    .filter(Boolean)
    .slice(0, 4);
  const [selectedValues, setSelectedValues] = useState<Record<number, string>>(() =>
    buildInitialSelection(variationGroups, product.variants, product.selectedVariantId)
  );
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(
    preferredVariant?.appliedOffer?.id ?? null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [hasUserSelectedVariant, setHasUserSelectedVariant] = useState(false);

  useEffect(() => {
    setSelectedValues(buildInitialSelection(variationGroups, product.variants, product.selectedVariantId));
    setSelectedOfferId(getPreferredVariant(product.variants, product.selectedVariantId)?.appliedOffer?.id ?? null);
    setHasUserSelectedVariant(false);
  }, [product.id, product.selectedVariantId]);

  const selectedVariant = getCompatibleVariant(product.variants, selectedValues, variationGroups);

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

  const selectedColorValue =
    colorGroup && selectedVariant
      ? getVariantAttributeValue(selectedVariant, colorGroup.attributeId)
      : colorGroup
        ? selectedValues[colorGroup.attributeId] || ""
        : "";
  const combinationOptionsByColor =
    colorGroup && nonColorGroups.length > 0
      ? buildCombinationOptionsByColor(canonicalVariants, colorGroup, nonColorGroups)
      : {};
  const combinationOptions =
    colorGroup && selectedColorValue
      ? combinationOptionsByColor[selectedColorValue] || []
      : nonColorGroups.length > 0
        ? buildCombinationOptions(canonicalVariants, nonColorGroups)
        : [];
  const selectedCombinationKey =
    selectedVariant && nonColorGroups.length > 0
      ? nonColorGroups
        .map((group) => getVariantAttributeValue(selectedVariant, group.attributeId))
        .join("||")
      : "";

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
    if (!user.id) {
      dispatch(toggleModal());
      return;
    }
    // TODO: implement add to wishlist when API is ready
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      return;
    }

    try {
      // Use addOrUpdateCartItem which checks if item exists and updates (replaces) instead of adding
      await addOrUpdateCartItem(selectedVariant.id, quantity);
      // Fetch the full cart data to get all product details
      // @ts-ignore - Ignore type error since dispatch handles Thunks with standard configureStore setup
      dispatch(fetchCart());
    } catch (error) {
      console.error('Unable to add product to cart', error);
    }
  };

  const selectedOfferPricing =
    selectedOfferId && selectedVariant
      ? selectedVariant.offerPrices.find((offerPrice) => offerPrice.offerId === selectedOfferId) || null
      : null;
  const selectedPrice =
    selectedOfferPricing?.finalPrice ?? selectedVariant?.finalPrice ?? selectedVariant?.price ?? null;
  const selectedOriginalPrice =
    selectedOfferPricing?.originalPrice ?? selectedVariant?.originalPrice ?? selectedVariant?.price ?? null;
  const selectedImages =
    (selectedVariant?.images?.length ? selectedVariant.images : product.baseImages).length > 0
      ? selectedVariant?.images?.length
        ? selectedVariant.images
        : product.baseImages
      : fallbackImages;
  const displayImages = selectedImages.length > 0 ? selectedImages : fallbackImages;
  const selectedStock = selectedVariant?.stock ?? null;
  const inStock = typeof selectedStock === "number" ? selectedStock > 0 : product.variants.length === 0;

  return (
    <div className="product-detail-grid">
      <div className="product-detail-image">
        <ProductImageGallery images={displayImages} alt={product.title} />
      </div>

      <div className="product-detail-content product-detail-panel">
        <div
          className="product-detail-meta-chips"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 10,
          }}
        >
          {product.categoryName && (
            <span
              className="product-detail-chip product-detail-chip--olive"
              style={{
                padding: "5px 11px",
                borderRadius: 999,
                background: "rgba(72, 85, 43, 0.08)",
                color: "var(--primary-background)",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {product.categoryName}
            </span>
          )}
          {product.brandName && (
            <span
              className="product-detail-chip product-detail-chip--saffron"
              style={{
                padding: "5px 11px",
                borderRadius: 999,
                background: "rgba(211, 84, 0, 0.08)",
                color: "var(--text-saffron)",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {product.brandName}
            </span>
          )}
        </div>

        <h1 className="section-title product-detail-title" style={{ marginBottom: "0.5rem" }}>
          {product.title}
        </h1>

        {(product.rating > 0 || product.reviewCount > 0) && (
          <div className="product-detail-rating-row">
            <div className="product-detail-stars" aria-label={`Rated ${product.rating} out of 5`}>
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  size={14}
                  className={index < Math.round(product.rating) ? "product-detail-star active" : "product-detail-star"}
                  fill={index < Math.round(product.rating) ? "currentColor" : "none"}
                />
              ))}
            </div>
            {product.rating > 0 && <span className="product-detail-rating-value">{product.rating.toFixed(1)}</span>}
            {product.reviewCount > 0 && (
              <span className="product-detail-rating-count">({product.reviewCount} reviews)</span>
            )}
          </div>
        )}

        {product.shortDescription && (
          <p
            className="product-detail-subtitle"
            style={{
              marginBottom: 14,
              fontSize: 15,
              color: "rgba(31, 43, 59, 0.78)",
            }}
          >
            {product.shortDescription}
          </p>
        )}

        {highlightTags.length > 0 && (
          <div className="product-detail-feature-tags">
            {highlightTags.map((tag) => (
              <span key={tag} className="product-detail-feature-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div
          className="product-price-panel"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div className="product-price-stack" style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span className="product-price-main" style={{ fontSize: 28, fontWeight: 800, color: "var(--text-gray)" }}>
              {toCurrency(selectedPrice) || "Price on request"}
            </span>
            {selectedOriginalPrice !== null &&
              selectedPrice !== null &&
              selectedOriginalPrice > selectedPrice && (
                <span
                  className="product-price-strike"
                  style={{
                    color: "#9ca3af",
                    fontSize: 16,
                    fontWeight: 600,
                    textDecoration: "line-through",
                  }}
                >
                  {toCurrency(selectedOriginalPrice)}
                </span>
              )}
          </div>

          <div
            className={`product-stock-pill ${inStock ? "is-in-stock" : "is-out-of-stock"}`}
            style={{
              padding: "8px 13px",
              borderRadius: 999,
              background: inStock ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)",
              color: inStock ? "#15803d" : "#b91c1c",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {inStock ? `In Stock${selectedStock ? ` • ${selectedStock} left` : ""}` : "Out of stock"}
          </div>
        </div>

        {selectedVariant?.offerPrices && selectedVariant.offerPrices.length > 0 && (
          <div className="product-offer-list" style={{ display: "grid", gap: 10, marginBottom: 18 }}>
            {selectedVariant.offerPrices.map((offer) => (
              <button
                key={offer.offerId}
                type="button"
                onClick={() => setSelectedOfferId(offer.offerId)}
                className={`product-offer-pill ${selectedOfferId === offer.offerId ? "is-selected" : ""}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 8,
                  padding: "11px 14px",
                  borderRadius: 14,
                  border: selectedOfferId === offer.offerId
                    ? "1px solid #f97316"
                    : "1px solid transparent",
                  background: "#fff1dc",
                  color: "#ea580c",
                  fontSize: 13,
                  fontWeight: 700,
                  boxShadow: selectedOfferId === offer.offerId
                    ? "0 8px 20px rgba(234, 88, 12, 0.12)"
                    : "0 6px 16px rgba(234, 88, 12, 0.06)",
                  cursor: "pointer",
                  width: "fit-content",
                  maxWidth: "100%",
                }}
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

        {variationGroups.length > 0 && (
          <div
            className="product-variation-panel"
            style={{
              background: "rgba(255, 253, 246, 0.96)",
              border: "1px solid rgba(72, 85, 43, 0.12)",
              borderRadius: 18,
              padding: 18,
              marginBottom: 20,
            }}
          >
            <div className="product-variation-head" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Sparkles size={15} color="var(--text-saffron)" />
              <h3 className="product-variation-title" style={{ fontSize: 16, fontWeight: 700, color: "var(--text-gray)" }}>
                Choose Your Variation
              </h3>
            </div>

            <div className="product-variation-groups" style={{ display: "grid", gap: 14 }}>
              {colorGroup && (
                <div key={colorGroup.attributeId} className="product-variation-group">
                  <div
                    className="product-variation-group-head"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <span className="product-variation-label" style={{ fontWeight: 700, color: "var(--text-gray)" }}>
                      {colorGroup.name}
                    </span>
                    <span className="product-variation-selected" style={{ fontSize: 12, color: "#6b7280" }}>
                      {selectedColorValue || "Select a color"}
                    </span>
                  </div>

                  <div className="product-variation-options" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {colorGroup.values.map((value) => {
                      const isSelected = selectedColorValue === value;

                      return (
                        <button
                          key={`${colorGroup.attributeId}-${value}`}
                          type="button"
                          onClick={() => {
                            setHasUserSelectedVariant(true);
                            setSelectedValues((current) => {
                              const nextSelection = {
                                ...current,
                                [colorGroup.attributeId]: value,
                              };

                              const exactVariant = getCompatibleVariant(
                                product.variants,
                                nextSelection,
                                variationGroups
                              );

                              if (exactVariant) {
                                return buildSelectionFromVariant(
                                  exactVariant,
                                  variationGroups,
                                  nextSelection
                                );
                              }

                              const fallbackVariant =
                                canonicalVariants.find(
                                  (variant) =>
                                    getVariantAttributeValue(variant, colorGroup.attributeId) === value
                                ) || null;

                              return buildSelectionFromVariant(
                                fallbackVariant,
                                variationGroups,
                                nextSelection
                              );
                            });
                          }}
                          className={`product-variation-option ${isSelected ? "is-selected" : ""}`}
                          style={{
                            borderRadius: 999,
                            border: isSelected
                              ? "1px solid var(--text-saffron)"
                              : "1px solid rgba(31, 43, 59, 0.16)",
                            background: isSelected ? "rgba(211, 84, 0, 0.08)" : "#fff",
                            color: "var(--text-gray)",
                            padding: "8px 14px",
                            minWidth: 70,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {colorGroup && nonColorGroups.length > 0 && (
                <div className="product-variation-group">
                  <div
                    className="product-variation-group-head"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <span className="product-variation-label" style={{ fontWeight: 700, color: "var(--text-gray)" }}>
                      {selectedColorValue ? `${selectedColorValue} ${nonColorGroups.map(g => g.name).join(" / ")}` : nonColorGroups.map(g => g.name).join(" / ")}
                    </span>
                    <span className="product-variation-selected" style={{ fontSize: 12, color: "#6b7280" }}>
                      {selectedVariant ? buildCombinationLabel(selectedVariant, nonColorGroups) : "Select an option"}
                    </span>
                  </div>

                  <div className="product-variation-options" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {combinationOptions.map((option) => {
                      const isSelected = option.key === selectedCombinationKey;

                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => {
                            setHasUserSelectedVariant(true);
                            setSelectedValues((current) =>
                              buildSelectionFromVariant(option.variant, variationGroups, current)
                            );
                          }}
                          className={`product-variation-option ${isSelected ? "is-selected" : ""}`}
                          style={{
                            borderRadius: 999,
                            border: isSelected
                              ? "1px solid var(--text-saffron)"
                              : "1px solid rgba(31, 43, 59, 0.16)",
                            background: isSelected ? "rgba(211, 84, 0, 0.08)" : "#fff",
                            color: "var(--text-gray)",
                            padding: "8px 14px",
                            minWidth: 70,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!colorGroup && variationGroups.map((group) => (
                <div key={group.attributeId} className="product-variation-group">
                  <div
                    className="product-variation-group-head"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <span className="product-variation-label" style={{ fontWeight: 700, color: "var(--text-gray)" }}>{group.name}</span>
                    <span className="product-variation-selected" style={{ fontSize: 12, color: "#6b7280" }}>
                      {selectedVariant?.attributes.find((attribute) => attribute.attributeId === group.attributeId)?.value || "Select an option"}
                    </span>
                  </div>

                  <div className="product-variation-options" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {group.values.map((value) => {
                      const isSelected =
                        selectedVariant?.attributes.find(
                          (attribute) => attribute.attributeId === group.attributeId
                        )?.value === value;

                      return (
                        <button
                          key={`${group.attributeId}-${value}`}
                          type="button"
                          onClick={() => {
                            setHasUserSelectedVariant(true);
                            setSelectedValues((current) => {
                              const nextSelection = {
                                ...current,
                                [group.attributeId]: value,
                              };

                              const exactVariant = getCompatibleVariant(
                                product.variants,
                                nextSelection,
                                variationGroups
                              );

                              if (exactVariant) {
                                return buildSelectionFromVariant(
                                  exactVariant,
                                  variationGroups,
                                  nextSelection
                                );
                              }

                              const fallbackVariant =
                                product.variants.find((variant) =>
                                  variant.attributes.some(
                                    (attribute) =>
                                      attribute.attributeId === group.attributeId &&
                                      attribute.value === value
                                  )
                                ) || null;

                              return buildSelectionFromVariant(
                                fallbackVariant,
                                variationGroups,
                                nextSelection
                              );
                            });
                          }}
                          className={`product-variation-option ${isSelected ? "is-selected" : ""}`}
                          style={{
                            borderRadius: 999,
                            border: isSelected
                              ? "1px solid var(--text-saffron)"
                              : "1px solid rgba(31, 43, 59, 0.16)",
                            background: isSelected ? "rgba(211, 84, 0, 0.08)" : "#fff",
                            color: "var(--text-gray)",
                            padding: "8px 14px",
                            minWidth: 70,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {product.descriptionHtml && (
          <div
            className="product-description"
            style={{ marginBottom: 24 }}
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        )}

        {product.attributes.length > 0 && (
          <div
            style={{
              marginBottom: 28,
              background: "#ffffff",
              borderRadius: 18,
              border: "1px solid rgba(31, 43, 59, 0.12)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 18px",
                background: "rgba(72, 85, 43, 0.06)",
                fontWeight: 700,
                color: "var(--text-gray)",
              }}
            >
              Product Details
            </div>

            <div style={{ display: "grid" }}>
              {product.attributes.map((attribute, index) => (
                <div
                  key={attribute.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "180px 1fr",
                    gap: 14,
                    padding: "14px 18px",
                    borderTop: index === 0 ? "none" : "1px solid rgba(31, 43, 59, 0.08)",
                  }}
                >
                  <div style={{ fontWeight: 600, color: "#6b7280" }}>{attribute.name}</div>
                  <div style={{ color: "var(--text-gray)" }}>{attribute.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "var(--text-gray)" }}>
            Quantity
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || !inStock}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                background: "#fff",
                cursor: quantity <= 1 ? "not-allowed" : "pointer",
                opacity: quantity <= 1 ? 0.5 : 1,
              }}
            >
              −
            </button>
            <input
              type="number"
              min="1"
              max={selectedVariant?.stock ?? 100}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={!inStock}
              style={{
                width: 60,
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: 6,
                textAlign: "center",
                fontSize: 16,
              }}
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              disabled={!inStock || (selectedVariant?.stock ? quantity >= selectedVariant.stock : false)}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                background: "#fff",
                cursor: !inStock || (selectedVariant?.stock ? quantity >= selectedVariant.stock : false) ? "not-allowed" : "pointer",
                opacity: !inStock || (selectedVariant?.stock ? quantity >= selectedVariant.stock : false) ? 0.5 : 1,
              }}
            >
              +
            </button>
            <span style={{ marginLeft: 16, fontSize: 14, color: "#666" }}>
              {selectedVariant?.stock ? `${selectedVariant.stock} in stock` : "In stock"}
            </span>
          </div>
        </div>

        <div className="product-action-row" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <button className="btn btn-primary btn-lg product-cta-button" disabled={!inStock} onClick={handleAddToCart}>
            <ShoppingCart size={18} style={{ marginRight: 8 }} />
            {inStock ? "Add to Cart" : "Unavailable"}
          </button>
          <button className="btn btn-outline btn-lg product-cta-button product-cta-button--secondary" disabled={!inStock}>
            <PackageCheck size={18} style={{ marginRight: 8 }} />
            Buy Now
          </button>
          <button 
            className="btn btn-outline btn-lg product-cta-button" 
            onClick={handleWishlist}
            aria-label="Add to wishlist"
            style={{ padding: "0 18px" }}
          >
            <Heart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

