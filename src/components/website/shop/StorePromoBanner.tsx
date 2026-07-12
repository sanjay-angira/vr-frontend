"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";

export type StoreBanner = {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link?: string;
};

type StorePromoBannerProps = {
  banners: StoreBanner[];
};

export function StorePromoBanner({ banners }: StorePromoBannerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  if (!banners.length) {
    return (
      <div className="store-promo store-promo--fallback">
        <div className="store-promo__copy">
          <p className="store-promo__eyebrow">Vrindavan Rasa</p>
          <h2>Authentic flavours for every ritual &amp; kitchen</h2>
          <p>Discover handcrafted spices, offerings, and essentials.</p>
        </div>
      </div>
    );
  }

  const current = banners[index];
  const image = resolveImageUrl(current.image || current.mobileImage || "");

  return (
    <div className="store-promo">
      {image && (
        <img
          src={image}
          alt={current.title}
          className="store-promo__image"
        />
      )}
      <div className="store-promo__overlay" />
      <div className="store-promo__copy">
        <p className="store-promo__eyebrow">Featured</p>
        <h2>{current.title}</h2>
        {current.subtitle && <p>{current.subtitle}</p>}
        <Link href={current.link || "/shop"} className="store-promo__cta">
          Shop Now
        </Link>
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            className="store-promo__nav store-promo__nav--prev"
            aria-label="Previous banner"
            onClick={() =>
              setIndex((prev) => (prev - 1 + banners.length) % banners.length)
            }
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="store-promo__nav store-promo__nav--next"
            aria-label="Next banner"
            onClick={() => setIndex((prev) => (prev + 1) % banners.length)}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}
