"use client";

import { Check, Tag } from "lucide-react";
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

function getOfferPercentage(
  offer: VariantPricingView["availableOffers"][number]
): number | null {
  if (
    offer.sellingPrice &&
    offer.sellingPrice > 0 &&
    offer.totalDiscount > 0
  ) {
    return Math.round((offer.totalDiscount / offer.sellingPrice) * 100);
  }

  const discountType = offer.discountType.toLowerCase();
  if (discountType === "percentage" || discountType === "percent") {
    return Math.round(offer.discountValue);
  }

  return null;
}

export default function ProductPriceBlock({ pricing, inStock }: ProductPriceBlockProps) {
  const sellingPrice = pricing.sellingPrice;
  const finalPrice = pricing.finalPrice ?? pricing.sellingPrice;
  const hasDiscount =
    sellingPrice !== null &&
    finalPrice !== null &&
    sellingPrice > finalPrice;

  const discountPercentage =
    hasDiscount && sellingPrice && pricing.totalDiscount > 0
      ? Math.round((pricing.totalDiscount / sellingPrice) * 100)
      : null;

  const offers = pricing.availableOffers ?? [];

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
        <span className="product-detail-price-stock is-in">In stock</span>
      )}

      {offers.length > 0 && (
        <div className="product-detail-offer-list-wrap">
          <div className="product-detail-offer-list-head">
            <Tag size={14} className="product-detail-offer-list-icon" />
            <span className="product-detail-offer-list-title">Available Offers</span>
          </div>
          <ul className="product-detail-offer-list">
            {offers.map((offer) => {
              const percentage = getOfferPercentage(offer);

              return (
                <li
                  key={offer.id}
                  className={`product-detail-offer-item ${offer.isApplied ? "is-applied" : ""}`}
                >
                  <div className="product-detail-offer-item__main">
                    <span className="product-detail-offer-item__name">{offer.offerName}</span>
                    {percentage !== null && percentage > 0 && (
                      <span className="product-detail-offer-item__badge">{percentage}% OFF</span>
                    )}
                    {offer.isApplied && (
                      <span className="product-detail-offer-item__applied">
                        <Check size={12} strokeWidth={3} />
                        Applied
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
