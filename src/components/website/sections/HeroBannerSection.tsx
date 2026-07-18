import Link from "next/link";
import Image from "next/image";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";
import type { HomepageBanner } from "@/types/homepage";

type HeroBannerSectionProps = {
  title?: string;
  subtitle?: string;
  banners: HomepageBanner[];
};

export function HeroBannerSection({
  title,
  subtitle,
  banners,
}: HeroBannerSectionProps) {
  const activeBanner = banners[0];

  if (!activeBanner) {
    return null;
  }

  const heading = (title || activeBanner.title || "").trim();
  const subHeading = (subtitle || activeBanner.subtitle || "").trim();
  const imageUrl = resolveImageUrl(activeBanner.image);
  const mobileImageUrl = resolveImageUrl(activeBanner.mobileImage);
  const hasDistinctMobile = Boolean(mobileImageUrl && mobileImageUrl !== imageUrl);
  const link = activeBanner.link?.trim() || "";
  const showCopy = Boolean(heading || subHeading);

  const media = (
    <div className="cms-hero-banner__media">
      {imageUrl ? (
        <>
          <Image
            src={imageUrl}
            alt={heading || "Banner"}
            fill
            priority
            className={`cms-hero-banner__image${hasDistinctMobile ? " cms-hero-banner__image--desktop" : ""}`}
            sizes="100vw"
          />
          {hasDistinctMobile && mobileImageUrl ? (
            <Image
              src={mobileImageUrl}
              alt={heading || "Banner"}
              fill
              priority
              className="cms-hero-banner__image cms-hero-banner__image--mobile"
              sizes="100vw"
            />
          ) : null}
        </>
      ) : (
        <div className="cms-hero-banner__fallback" aria-hidden />
      )}
      {showCopy ? <div className="cms-hero-banner__shade" aria-hidden /> : null}
    </div>
  );

  const copy = showCopy ? (
    <div className="cms-hero-banner__content">
      <div className="container cms-hero-banner__inner">
        {subHeading ? <p className="cms-hero-banner__eyebrow">{subHeading}</p> : null}
        {heading ? <h1 className="cms-hero-banner__title">{heading}</h1> : null}
        {link ? (
          <Link href={link} className="btn btn-primary btn-lg cms-hero-banner__cta">
            Shop Now
          </Link>
        ) : null}
      </div>
    </div>
  ) : null;

  return (
    <section className="cms-hero-banner" aria-label={heading || "Featured banner"}>
      {link && !showCopy ? (
        <Link href={link} className="cms-hero-banner__link">
          {media}
        </Link>
      ) : (
        media
      )}
      {copy}
    </section>
  );
}
