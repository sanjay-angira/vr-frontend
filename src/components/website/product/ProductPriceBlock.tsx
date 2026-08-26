"use client";

import { Check } from "lucide-react";
import type { VariantPricingView } from "@/components/website/product/productApi";

type ProductPriceBlockProps = {
  pricing: VariantPricingView;
  inStock: boolean;
};

function toCurrency(value: number | null | undefined): string | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return `Rs. ${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function ProductPriceBlock({ pricing, inStock }: ProductPriceBlockProps) {
  const sellingPrice = pricing.sellingPrice;
  const finalPrice = pricing.finalPrice ?? pricing.sellingPrice;
  const hasDiscount =
    sellingPrice !== null &&
    finalPrice !== null &&
    sellingPrice > finalPrice;

  const offerType = pricing.appliedOffer?.discountType?.toLowerCase();
  const discountPercentage = (() => {
    if (!hasDiscount) return null;
    if (offerType === "percentage" || offerType === "percent") {
      const configured = Math.round(Number(pricing.appliedOffer?.discountValue) || 0);
      return configured > 0 ? configured : null;
    }
    if (sellingPrice && pricing.totalDiscount > 0) {
      return Math.round((pricing.totalDiscount / sellingPrice) * 100);
    }
    return null;
  })();

  if (finalPrice === null && sellingPrice === null) {
    return null;
  }

  return (
    <div className="product-detail-price-block">
      <div className="product-detail-price-row">
        <span className="product-detail-price-current">
          {toCurrency(finalPrice) || "Price on request"}
        </span>
        {hasDiscount && sellingPrice !== null && (
          <span className="product-detail-price-original">{toCurrency(sellingPrice)}</span>
        )}
        {discountPercentage !== null && discountPercentage > 0 && (
          <span className="product-detail-price-badge">{discountPercentage}% OFF</span>
        )}
      </div>

      {!inStock && <span className="product-detail-price-stock is-out">Out of stock</span>}
      {inStock && pricing.sellingPrice !== null && (
        <span className="product-detail-price-stock is-in">
          <Check size={14} strokeWidth={2.5} aria-hidden />
          In stock
        </span>
      )}
    </div>
  );
}
