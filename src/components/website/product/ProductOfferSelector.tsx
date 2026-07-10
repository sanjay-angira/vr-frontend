"use client";

import { Check, Sparkles, Tag } from "lucide-react";

type OfferPrice = {
  offerId: number;
  offerName: string;
  discountType: string;
  discountValue: number;
  originalPrice: number | null;
  finalPrice: number | null;
  discountAmount: number;
  discountPercentage: number;
};

type ProductOfferSelectorProps = {
  offers: OfferPrice[];
  selectedOfferId: number | null;
  onSelectOffer: (offerId: number) => void;
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

function getOfferPercentage(offer: OfferPrice): number | null {
  if (typeof offer.discountPercentage === "number" && offer.discountPercentage > 0) {
    return Math.round(offer.discountPercentage);
  }

  const discountType = offer.discountType.toLowerCase();
  if (discountType === "percentage" || discountType === "percent") {
    return Math.round(offer.discountValue);
  }

  return null;
}

export default function ProductOfferSelector({
  offers,
  selectedOfferId,
  onSelectOffer,
}: ProductOfferSelectorProps) {
  if (!offers.length) {
    return null;
  }

  const selectedOffer =
    offers.find((offer) => offer.offerId === selectedOfferId) ?? offers[0];

  return (
    <section className="product-offer-showcase" aria-label="Available offers">
      <div className="product-offer-showcase__head">
        <div className="product-offer-showcase__title-wrap">
          <Tag size={16} className="product-offer-showcase__icon" />
          <h3 className="product-offer-showcase__title">Available Offers</h3>
        </div>
        {selectedOffer?.finalPrice !== null && (
          <div className="product-offer-showcase__price">
            <span className="product-offer-showcase__price-current">
              {toCurrency(selectedOffer.finalPrice) || "Price on request"}
            </span>
            {selectedOffer.originalPrice !== null &&
              selectedOffer.finalPrice !== null &&
              selectedOffer.originalPrice > selectedOffer.finalPrice && (
                <span className="product-offer-showcase__price-original">
                  {toCurrency(selectedOffer.originalPrice)}
                </span>
              )}
          </div>
        )}
      </div>

      <div className="product-offer-card-grid">
        {offers.map((offer) => {
          const isSelected = selectedOfferId === offer.offerId;
          const percentage = getOfferPercentage(offer);

          return (
            <button
              key={offer.offerId}
              type="button"
              onClick={() => onSelectOffer(offer.offerId)}
              className={`product-offer-card ${isSelected ? "is-selected" : ""}`}
              aria-pressed={isSelected}
            >
              <span className="product-offer-card__sparkle" aria-hidden="true">
                <Sparkles size={14} />
              </span>

              {isSelected && (
                <span className="product-offer-card__check" aria-hidden="true">
                  <Check size={14} strokeWidth={3} />
                </span>
              )}

              <span className="product-offer-card__title">{offer.offerName}</span>

              {percentage !== null && percentage > 0 && (
                <span className="product-offer-card__badge">{percentage}% OFF</span>
              )}

              {offer.finalPrice !== null && (
                <span className="product-offer-card__price">
                  {toCurrency(offer.finalPrice)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
