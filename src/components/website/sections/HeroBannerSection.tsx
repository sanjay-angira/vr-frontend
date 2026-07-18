"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";
import type { HomepageBanner } from "@/types/homepage";

type HeroBannerSectionProps = {
  title?: string;
  subtitle?: string;
  banners: HomepageBanner[];
};

const AUTO_MS = 5500;

export function HeroBannerSection({
  title,
  subtitle,
  banners,
}: HeroBannerSectionProps) {
  const slides = banners.filter(Boolean);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const count = slides.length;

  const goTo = useCallback(
    (next: number) => {
      if (count <= 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    if (count <= 1 || isPaused) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [count, isPaused]);

  useEffect(() => {
    if (index >= count && count > 0) {
      setIndex(0);
    }
  }, [count, index]);

  if (count === 0) {
    return null;
  }

  const activeBanner = slides[Math.min(index, count - 1)];
  const heading = (activeBanner.title || title || "").trim();
  const subHeading = (activeBanner.subtitle || subtitle || "").trim();
  const imageUrl = resolveImageUrl(activeBanner.image);
  const mobileImageUrl = resolveImageUrl(activeBanner.mobileImage);
  const hasDistinctMobile = Boolean(mobileImageUrl && mobileImageUrl !== imageUrl);
  const link = activeBanner.link?.trim() || "";
  const showCopy = Boolean(heading || subHeading);
  const showControls = count > 1;

  return (
    <section
      className="cms-hero-banner"
      aria-label={heading || "Featured banner"}
      aria-roledescription="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
    >
      <div className="cms-hero-banner__viewport">
        {slides.map((banner, slideIndex) => {
          const isActive = slideIndex === index;
          const slideHeading = (banner.title || title || "").trim();
          const slideImage = resolveImageUrl(banner.image);
          const slideMobile = resolveImageUrl(banner.mobileImage);
          const slideHasMobile = Boolean(slideMobile && slideMobile !== slideImage);
          const slideLink = banner.link?.trim() || "";

          const slideMedia = (
            <div className="cms-hero-banner__media">
              {slideImage ? (
                <>
                  <Image
                    src={slideImage}
                    alt={slideHeading || `Banner ${slideIndex + 1}`}
                    fill
                    priority={slideIndex === 0}
                    className={`cms-hero-banner__image${
                      slideHasMobile ? " cms-hero-banner__image--desktop" : ""
                    }`}
                    sizes="100vw"
                  />
                  {slideHasMobile && slideMobile ? (
                    <Image
                      src={slideMobile}
                      alt={slideHeading || `Banner ${slideIndex + 1}`}
                      fill
                      priority={slideIndex === 0}
                      className="cms-hero-banner__image cms-hero-banner__image--mobile"
                      sizes="100vw"
                    />
                  ) : null}
                </>
              ) : (
                <div className="cms-hero-banner__fallback" aria-hidden />
              )}
            </div>
          );

          return (
            <div
              key={banner.id || slideIndex}
              className={`cms-hero-banner__slide${isActive ? " is-active" : ""}`}
              aria-hidden={!isActive}
            >
              {slideLink && !isActive ? (
                <div className="cms-hero-banner__link">{slideMedia}</div>
              ) : slideLink && isActive && !showCopy ? (
                <Link href={slideLink} className="cms-hero-banner__link">
                  {slideMedia}
                </Link>
              ) : (
                slideMedia
              )}
            </div>
          );
        })}

        {showCopy ? <div className="cms-hero-banner__shade" aria-hidden /> : null}

        {showCopy ? (
          <div className="cms-hero-banner__content" key={`copy-${activeBanner.id}-${index}`}>
            <div className="container cms-hero-banner__inner">
              {subHeading ? (
                <p className="cms-hero-banner__eyebrow">{subHeading}</p>
              ) : null}
              {heading ? <h1 className="cms-hero-banner__title">{heading}</h1> : null}
              {link ? (
                <Link href={link} className="btn btn-primary btn-lg cms-hero-banner__cta">
                  Shop Now
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {showControls ? (
        <>
          <button
            type="button"
            className="cms-hero-banner__nav cms-hero-banner__nav--prev"
            aria-label="Previous banner"
            onClick={goPrev}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className="cms-hero-banner__nav cms-hero-banner__nav--next"
            aria-label="Next banner"
            onClick={goNext}
          >
            <ChevronRight size={22} />
          </button>

          <div className="cms-hero-banner__dots" role="tablist" aria-label="Banner slides">
            {slides.map((banner, slideIndex) => (
              <button
                key={banner.id || slideIndex}
                type="button"
                role="tab"
                aria-selected={slideIndex === index}
                aria-label={`Go to banner ${slideIndex + 1}`}
                className={`cms-hero-banner__dot${
                  slideIndex === index ? " is-active" : ""
                }`}
                onClick={() => goTo(slideIndex)}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
