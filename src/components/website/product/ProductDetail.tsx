"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Heart,
  MapPin,
  RefreshCw,
  Repeat2,
  ShieldCheck,
  ShoppingCart,
  Star,
  Zap,
} from "lucide-react";
import ProductImageGallery from "@/components/website/product/ProductImageGallery";
import GroupedVariantPicker from "@/components/website/product/GroupedVariantPicker";
import ProductPriceBlock from "@/components/website/product/ProductPriceBlock";
import { ProductOffersSection } from "@/components/website/product/ProductOffersSection";
import { ProductCouponBanner } from "@/components/website/product/ProductCouponBanner";
import type { ProductVariantView } from "@/components/website/product/productApi";
import type { WebsiteCoupon } from "@/services/website/couponService";
import {
  buildAttributeGroups,
  findVariantBySlug,
  hasVariantOptionGroups,
  replaceProductVariantInUrl,
  resolveInitialVariant,
} from "@/components/website/product/productVariantUtils";
import { fetchWebsiteCart } from "@/services/redux/slices/websiteSlices/cartSlice";
import { addOrUpdateCartItem } from "@/services/website/cartService";
import { trackRecentlyViewedProduct } from "@/services/website/recentlyViewedService";
import { useWishlist } from "@/components/website/wishlist/useWishlist";
import { useRouter } from "next/navigation";
import { getData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";

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
  availableCoupons?: WebsiteCoupon[];
};

type Props = {
  product: ProductDetailView;
  fallbackImages?: string[];
  initialVariantSlug?: string | null;
};

type DeliveryStatus = {
  serviceable: boolean;
  pincode: string;
  shippingFee: number;
  freeShipping: boolean;
  codAvailable: boolean;
  prepaidAvailable: boolean;
  estimatedDeliveryDate?: string | null;
  city?: string | null;
  message: string;
};

function formatInr(value: number | null | undefined) {
  const rounded = Number.isFinite(Number(value)) ? Number(value) : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rounded);
}

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
  const { isWished, toggle } = useWishlist();
  const [wishBusy, setWishBusy] = useState(false);

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
  const [pincode, setPincode] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus | null>(null);
  const [deliveryMessage, setDeliveryMessage] = useState<string>("");
  const [deliveryMode, setDeliveryMode] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [locationLoading, setLocationLoading] = useState(false);

  const selectedVariant = useMemo(() => {
    if (selectedVariantId) {
      const matched = product.variants.find((variant) => variant.id === selectedVariantId);
      if (matched) return matched;
    }

    return product.variants[0] ?? null;
  }, [product.variants, selectedVariantId]);

  const getSelectedVariantPrice = useCallback(() => {
    const price =
      Number(selectedVariant?.pricing?.finalPrice ?? selectedVariant?.pricing?.sellingPrice ?? selectedVariant?.price ?? 0) || 0;
    return Number.isFinite(price) ? price : 0;
  }, [selectedVariant]);

  const checkDelivery = useCallback(
    async (pinOverride?: string) => {
      const normalizedPin = (pinOverride ?? pincode ?? "").replace(/\D/g, "").slice(0, 6);
      if (!/^\d{6}$/.test(normalizedPin)) {
        setDeliveryStatus(null);
        setDeliveryMode("error");
        setDeliveryMessage("Please enter a valid 6-digit Indian PIN code.");
        return;
      }

      const amount = getSelectedVariantPrice();
      const weight = Number(selectedVariant?.packageWeightGrams ?? 0) || 0;
      const packageHeightCm = Number(selectedVariant?.packageHeightCm ?? 0) || 0;
      const packageWidthCm = Number(selectedVariant?.packageWidthCm ?? 0) || 0;
      const packageLengthCm = Number(selectedVariant?.packageLengthCm ?? 0) || 0;

      setDeliveryMode("loading");
      setDeliveryMessage("");
      setPincode(normalizedPin);

      try {
        const response = (await getData(API_ENDPOINTS.SHIPPING.CHECK_PIN, {
          pincode: normalizedPin,
          subtotal: amount,
          weightGrams: weight,
          packageHeightCm,
          packageWidthCm,
          packageLengthCm,
          paymentMode: "Pre-paid",
        })) as { success?: boolean; message?: string; data?: DeliveryStatus };

        if (response?.success === false || (!response?.data && response?.message)) {
          throw new Error(response?.message || "Unable to check delivery availability");
        }

        const status = response?.data ?? null;
        setDeliveryStatus(status);
        setDeliveryMode(status && status.serviceable ? "success" : "error");
        setDeliveryMessage(
          status?.message ||
            (status && status.serviceable
              ? `Delivery available to ${normalizedPin}`
              : `Delivery is unavailable for ${normalizedPin}.`)
        );
      } catch (error) {
        setDeliveryStatus(null);
        setDeliveryMode("error");
        setDeliveryMessage(
          error instanceof Error
            ? error.message
            : "Unable to check delivery availability right now."
        );
      }
    },
    [getSelectedVariantPrice, pincode, selectedVariant]
  );

  const handleUseMyLocation = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setDeliveryMode("error");
      setDeliveryMessage("This browser cannot access your location. Please enter the PIN code manually.");
      return;
    }

    setLocationLoading(true);
    setDeliveryMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = (await getData(API_ENDPOINTS.SHIPPING.REVERSE_GEOCODE, {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })) as { success?: boolean; message?: string; data?: { pincode?: string | null; message?: string } };

          const pincodeFromLocation = response?.data?.pincode ?? null;

          if (!pincodeFromLocation) {
            setDeliveryStatus(null);
            setDeliveryMode("error");
            setDeliveryMessage(
              response?.data?.message ||
                response?.message ||
                "We could not find a postal code for your current location. Please enter the PIN code manually."
            );
            return;
          }

          const confirmed = window.confirm(
            `Current location appears to be in PIN code ${pincodeFromLocation}. Please confirm this is your delivery PIN code.`
          );

          if (!confirmed) {
            setPincode(pincodeFromLocation);
            setDeliveryMode("error");
            setDeliveryMessage("Please confirm the PIN code before continuing.");
            return;
          }

          await checkDelivery(pincodeFromLocation);
        } catch (error) {
          setDeliveryStatus(null);
          setDeliveryMode("error");
          setDeliveryMessage(
            error instanceof Error
              ? error.message
              : "We could not use your current location. Please enter the PIN code manually."
          );
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        setDeliveryStatus(null);
        setDeliveryMode("error");

        const message =
          error.code === 1
            ? "Location permission was denied. Please enter your PIN code manually."
            : error.code === 2
              ? "Location is currently unavailable. Please enter your PIN code manually."
              : error.code === 3
                ? "Location request timed out. Please enter your PIN code manually."
                : "Unable to access your location. Please enter your PIN code manually.";

        setDeliveryMessage(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [checkDelivery]);

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

  useEffect(() => {
    document.body.classList.add("has-pdp-cta-bar");
    return () => document.body.classList.remove("has-pdp-cta-bar");
  }, []);

  useEffect(() => {
    if (!product.id) return;
    // Avoid duplicate POSTs under React Strict Mode remounts.
    const timer = window.setTimeout(() => {
      void trackRecentlyViewedProduct(product.id);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [product.id]);

  const handleWishlist = async () => {
    if (!selectedVariant || wishBusy) return;
    setWishBusy(true);
    try {
      await toggle(selectedVariant.id);
    } finally {
      setWishBusy(false);
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

  const wished = isWished(selectedVariant?.id);

  const wishlistButton = (
    <button
      type="button"
      className={`product-gallery__wishlist${wished ? " is-wished" : ""}`}
      onClick={() => void handleWishlist()}
      aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wished}
      disabled={wishBusy || !selectedVariant}
    >
      <Heart size={18} fill={wished ? "currentColor" : "none"} />
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
          <ProductPriceBlock
            pricing={selectedVariant.pricing}
            inStock={inStock}
          />
        )}

        {selectedVariant && (
          <ProductOffersSection
            pricing={selectedVariant.pricing}
            coupons={product.availableCoupons ?? []}
          />
        )}

        <section className="product-delivery-check" aria-label="Delivery availability">
          <h2 className="product-delivery-check__title">Delivery availability</h2>

          <div className="product-delivery-check__form">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit PIN code"
              value={pincode}
              onChange={(event) => setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              aria-label="PIN code"
              className="product-delivery-check__input"
            />
            <button
              type="button"
              disabled={deliveryMode === "loading"}
              onClick={() => void checkDelivery()}
              className="product-delivery-check__submit"
            >
              {deliveryMode === "loading" ? "Checking..." : "Check Delivery"}
            </button>
            <button
              type="button"
              disabled={locationLoading}
              onClick={() => void handleUseMyLocation()}
              className="product-delivery-check__location"
            >
              <MapPin size={16} aria-hidden="true" />
              <span>{locationLoading ? "Locating..." : "Use My Location"}</span>
            </button>
          </div>

          {deliveryMode !== "idle" && (
            <div
              role="status"
              aria-live="polite"
              className={`product-delivery-check__message${deliveryMode === "error" ? " is-error" : ""}`}
            >
              {deliveryMessage}
            </div>
          )}

          {deliveryStatus && (
            <div className="product-delivery-check__summary">
              <div className="product-delivery-check__result">
                {deliveryStatus.serviceable ? "✓ Delivery available to this PIN code" : "✕ Delivery unavailable for this PIN code"}
              </div>
              <div className="product-delivery-check__detail">
                Shipping: <strong>{deliveryStatus.freeShipping ? "Free" : formatInr(deliveryStatus.shippingFee)}</strong>
              </div>
              {deliveryStatus.codAvailable !== undefined && (
                <div className="product-delivery-check__detail">
                  COD: <strong>{deliveryStatus.codAvailable ? "Available" : "Not available"}</strong>
                </div>
              )}
              {deliveryStatus.estimatedDeliveryDate && (
                <div className="product-delivery-check__detail">
                  Estimated delivery: <strong>{deliveryStatus.estimatedDeliveryDate}</strong>
                </div>
              )}
            </div>
          )}
        </section>

        {showVariantPicker && (
          <GroupedVariantPicker
            variants={product.variants}
            attributeGroups={attributeGroups}
            selectedVariantId={selectedVariantId}
            onSelectVariant={handleVariantSelect}
          />
        )}

        <div className="product-action-row">
          <div className="product-quantity-stepper" aria-label="Quantity">
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

          <div className="product-cta-bar">
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
              <Zap size={18} aria-hidden="true" />
              Buy Now
            </button>
          </div>
        </div>

        <ProductCouponBanner
          coupons={product.availableCoupons ?? []}
          variantId={selectedVariant?.id ?? null}
        />

        <ul className="product-trust-row" aria-label="Purchase benefits">
          <li>
            <ShieldCheck size={16} aria-hidden="true" />
            <span>Secure Payment</span>
          </li>
          <li>
            <RefreshCw size={16} aria-hidden="true" />
            <span>7 Days Return</span>
          </li>
          <li>
            <Repeat2 size={16} aria-hidden="true" />
            <span>Easy Replacement</span>
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
