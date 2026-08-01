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

  if (!banners.length) return null;

  const current = banners[index];
  const image = resolveImageUrl(current.image || current.mobileImage || "");
  if (!image) return null;

  const media = (
    <img
      src={image}
      alt={current.title || "Banner"}
      className="store-promo__image"
    />
  );

  const href = current.link?.trim();

  return (
    <div className="store-promo store-promo--image-only">
      {href ? (
        <Link href={href} className="store-promo__media-link" aria-label={current.title || "Banner"}>
          {media}
        </Link>
      ) : (
        media
      )}

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
