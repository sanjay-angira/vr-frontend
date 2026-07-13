import Link from "next/link";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";
import type { HomepageBanner } from "@/types/homepage";
import Image from "next/image";

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
        <Image src={imageUrl} alt={heading} className="hero-bg object-cover" fill />
      ) : null}
    </section>
  );
}
