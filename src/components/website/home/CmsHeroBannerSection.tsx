import Link from "next/link";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";
import type { HomepageBanner } from "@/types/homepage";

type CmsHeroBannerSectionProps = {
  title?: string;
  subtitle?: string;
  banners: HomepageBanner[];
};

export function CmsHeroBannerSection({
  title,
  subtitle,
  banners,
}: CmsHeroBannerSectionProps) {
  const activeBanner = banners[0];

  if (!activeBanner) {
    return null;
  }

  const heading = title || activeBanner.title;
  const subHeading = subtitle || activeBanner.subtitle;
  const imageUrl = resolveImageUrl(activeBanner.image);

  return (
    <section className="hero cms-hero-banner">
      {imageUrl ? (
        <img src={imageUrl} alt={heading} className="hero-bg object-cover" />
      ) : null}
      <div className="hero-overlay" />

      <div className="hero-content">
        <h1 className="hero-title">{heading}</h1>
        {subHeading ? <p className="hero-subtitle">{subHeading}</p> : null}

        {activeBanner.link ? (
          <div className="hero-actions">
            <Link href={activeBanner.link} className="btn btn-primary btn-lg">
              Shop Now
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
