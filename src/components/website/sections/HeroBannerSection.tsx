"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Settings } from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";
import type { HomepageBanner } from "@/types/homepage";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Slider = dynamic(() => import("react-slick"), {
  ssr: false,
  loading: () => <div className="cms-hero-banner__skeleton" aria-hidden />,
});

export type HeroBannerEffect = "fade" | "slide";

type HeroBannerSectionProps = {
  title?: string;
  subtitle?: string;
  banners: HomepageBanner[];
  /** Carousel transition. Defaults to fade. */
  effect?: HeroBannerEffect | string | null;
};

type ArrowProps = {
  onClick?: () => void;
};

function normalizeEffect(effect?: string | null): HeroBannerEffect {
  return effect === "slide" ? "slide" : "fade";
}

function PrevArrow({ onClick }: ArrowProps) {
  return (
    <button
      type="button"
      className="cms-hero-banner__nav cms-hero-banner__nav--prev"
      aria-label="Previous banner"
      onClick={onClick}
    >
      <ChevronLeft size={22} />
    </button>
  );
}

function NextArrow({ onClick }: ArrowProps) {
  return (
    <button
      type="button"
      className="cms-hero-banner__nav cms-hero-banner__nav--next"
      aria-label="Next banner"
      onClick={onClick}
    >
      <ChevronRight size={22} />
    </button>
  );
}

export function HeroBannerSection({
  banners,
  effect,
}: HeroBannerSectionProps) {
  const [mounted, setMounted] = useState(false);
  const bannerEffect = normalizeEffect(effect);
  const slides = useMemo(
    () =>
      Array.isArray(banners)
        ? banners.filter((banner) => Boolean(banner?.image || banner?.mobileImage))
        : [],
    [banners]
  );
  const count = slides.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  const settings = useMemo<Settings>(
    () => ({
      dots: count > 1,
      infinite: count > 1,
      speed: bannerEffect === "slide" ? 600 : 700,
      fade: bannerEffect === "fade",
      cssEase: "ease-in-out",
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: count > 1,
      autoplaySpeed: 4000,
      pauseOnHover: false,
      pauseOnFocus: false,
      pauseOnDotsHover: false,
      arrows: count > 1,
      swipe: count > 1,
      draggable: count > 1,
      touchMove: count > 1,
      prevArrow: <PrevArrow />,
      nextArrow: <NextArrow />,
      adaptiveHeight: true,
      waitForAnimate: false,
      dotsClass: "slick-dots cms-hero-banner__dots",
    }),
    [count, bannerEffect]
  );

  if (count === 0) {
    return null;
  }

  // Avoid slick until client mount so slide widths calculate correctly
  if (!mounted) {
    return (
      <section className="cms-hero-banner" aria-label="Featured banner">
        <HeroSlide banner={slides[0]} />
      </section>
    );
  }

  if (count === 1) {
    return (
      <section className="cms-hero-banner" aria-label="Featured banner">
        <HeroSlide banner={slides[0]} />
      </section>
    );
  }

  return (
    <section
      className={`cms-hero-banner cms-hero-banner--slick cms-hero-banner--${bannerEffect}`}
      aria-label="Featured banner"
    >
      <Slider key={`hero-slick-${bannerEffect}-${count}`} {...settings}>
        {slides.map((banner, index) => (
          <div key={`${banner.id}-${index}`}>
            <HeroSlide banner={banner} />
          </div>
        ))}
      </Slider>
    </section>
  );
}

function HeroSlide({ banner }: { banner: HomepageBanner }) {
  const desktopSrc = resolveImageUrl(banner.image || banner.mobileImage || "");
  const mobileSrc = resolveImageUrl(banner.mobileImage || banner.image || "");
  const hasDistinctMobile = Boolean(
    mobileSrc && desktopSrc && mobileSrc !== desktopSrc
  );
  const link = banner.link?.trim() || "";
  const alt = (banner.title || "Banner").trim();

  const media = (
    <div className="cms-hero-banner__media">
      {desktopSrc ? (
        <picture>
          {hasDistinctMobile ? (
            <source media="(max-width: 899px)" srcSet={mobileSrc} />
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={desktopSrc}
            alt={alt}
            className="cms-hero-banner__image"
            decoding="async"
            fetchPriority="high"
          />
        </picture>
      ) : (
        <div className="cms-hero-banner__fallback" aria-hidden />
      )}
    </div>
  );

  return (
    <div className="cms-hero-banner__slide-inner">
      {link ? (
        <Link href={link} className="cms-hero-banner__link" aria-label={alt}>
          {media}
        </Link>
      ) : (
        media
      )}
    </div>
  );
}
