"use client";

import { useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Gift,
  Percent,
  Tag,
  TicketPercent,
  Wallet,
} from "lucide-react";
import type { VariantPricingView } from "@/components/website/product/productApi";
import type { WebsiteCoupon } from "@/services/website/couponService";

type Offer = VariantPricingView["availableOffers"][number];

type ProductOffersSectionProps = {
  pricing: VariantPricingView;
  coupons?: WebsiteCoupon[];
};

function getOfferPercentage(offer: Offer): number | null {
  const discountType = offer.discountType.toLowerCase();
  if (discountType === "percentage" || discountType === "percent") {
    const configured = Math.round(Number(offer.discountValue) || 0);
    return configured > 0 ? configured : null;
  }

  if (offer.sellingPrice && offer.sellingPrice > 0 && offer.totalDiscount > 0) {
    return Math.round((offer.totalDiscount / offer.sellingPrice) * 100);
  }

  return null;
}

function formatOfferDiscount(offer: Offer): string {
  const percentage = getOfferPercentage(offer);
  if (percentage !== null && percentage > 0) {
    return `${percentage}% OFF`;
  }

  const type = offer.discountType.toLowerCase();
  if (type === "flat" || type === "fixed" || type === "amount") {
    return `₹${Number(offer.discountValue || 0).toLocaleString("en-IN")} OFF`;
  }

  if (offer.totalDiscount > 0) {
    return `₹${Number(offer.totalDiscount).toLocaleString("en-IN")} OFF`;
  }

  return "Special offer";
}

function formatCouponLabel(coupon: WebsiteCoupon): string {
  const type = coupon.discountType.toLowerCase();
  if (type === "percentage" || type === "percent") {
    return `Extra ${Math.round(coupon.discountValue)}% OFF with coupon`;
  }
  return `Extra ₹${Number(coupon.discountValue || 0).toLocaleString("en-IN")} OFF with coupon`;
}

function offerIcon(index: number) {
  const icons = [Percent, Gift, Wallet, Tag, TicketPercent];
  const Icon = icons[index % icons.length];
  return <Icon size={22} strokeWidth={1.75} aria-hidden />;
}

function sourceHint(offer: Offer): string {
  const sources = (offer.sources || []).map((s) => s.toLowerCase());
  if (sources.includes("product")) return "Product offer · auto at checkout";
  if (sources.includes("variant")) return "Variant offer · auto at checkout";
  if (sources.includes("category")) return "Category offer · auto at checkout";
  if (sources.includes("brand")) return "Brand offer · auto at checkout";
  return "Auto-applied at checkout";
}

export function ProductOffersSection({
  pricing,
  coupons = [],
}: ProductOffersSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const offers = useMemo(() => {
    const list = [...(pricing.availableOffers ?? [])];
    list.sort((a, b) => Number(b.isApplied) - Number(a.isApplied));
    return list;
  }, [pricing.availableOffers]);

  const hasApplied = offers.some((offer) => offer.isApplied);
  const primaryCoupon = coupons[0] ?? null;
  const visibleOffers = expanded ? offers : offers.slice(0, 6);

  if (!offers.length && !primaryCoupon) {
    return null;
  }

  const scrollNext = () => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: Math.min(280, el.clientWidth * 0.75), behavior: "smooth" });
  };

  const handleCopy = async () => {
    if (!primaryCoupon?.couponCode) return;
    try {
      await navigator.clipboard.writeText(primaryCoupon.couponCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="product-offers-section" aria-label="Available offers">
      <div className="product-offers-section__head">
        <div className="product-offers-section__title-wrap">
          <Tag size={16} className="product-offers-section__title-icon" aria-hidden />
          <h3 className="product-offers-section__title">
            Available Offers{offers.length ? ` (${offers.length})` : ""}
          </h3>
        </div>
        {hasApplied ? (
          <p className="product-offers-section__status">
            <CheckCircle2 size={16} aria-hidden />
            Best savings applied
          </p>
        ) : null}
      </div>

      {offers.length > 0 ? (
        <div className="product-offers-section__carousel">
          <div
            ref={trackRef}
            className={`product-offers-section__track${
              expanded ? " is-expanded" : ""
            }`}
          >
            {visibleOffers.map((offer, index) => {
              const isBest = offer.isApplied;
              return (
                <article
                  key={offer.id}
                  className={`product-offers-card${isBest ? " is-best" : ""}`}
                >
                  {isBest ? (
                    <span className="product-offers-card__badge">Best Offer</span>
                  ) : null}

                  <div className="product-offers-card__icon">{offerIcon(index)}</div>

                  <h4 className="product-offers-card__name">{offer.offerName}</h4>
                  <p className="product-offers-card__discount">
                    {formatOfferDiscount(offer)}
                  </p>
                  <p className="product-offers-card__hint">{sourceHint(offer)}</p>

                  <button
                    type="button"
                    className={`product-offers-card__action${
                      isBest ? " is-applied" : ""
                    }`}
                    disabled
                    aria-disabled="true"
                  >
                    {isBest ? (
                      <>
                        <Check size={14} strokeWidth={3} aria-hidden />
                        Applied
                      </>
                    ) : (
                      "Apply"
                    )}
                  </button>
                </article>
              );
            })}
          </div>

          {!expanded && offers.length > 2 ? (
            <button
              type="button"
              className="product-offers-section__nav"
              onClick={scrollNext}
              aria-label="Scroll offers"
            >
              <ChevronRight size={20} aria-hidden />
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="product-offers-section__footer">
        {primaryCoupon ? (
          <div className="product-offers-coupon">
            <div className="product-offers-coupon__icon" aria-hidden>
              <TicketPercent size={20} />
            </div>
            <div className="product-offers-coupon__copy">
              <p className="product-offers-coupon__text">
                {formatCouponLabel(primaryCoupon)}
              </p>
              <p className="product-offers-coupon__code">
                Use code: <strong>{primaryCoupon.couponCode}</strong>
              </p>
            </div>
            <button
              type="button"
              className="product-offers-coupon__btn"
              onClick={() => void handleCopy()}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        ) : null}

        {offers.length > 2 ? (
          <button
            type="button"
            className="product-offers-section__view-all"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
          >
            {expanded ? "Show less" : "View All Offers"}
            <ChevronDown
              size={16}
              className={expanded ? "is-open" : undefined}
              aria-hidden
            />
          </button>
        ) : null}
      </div>
    </section>
  );
}
