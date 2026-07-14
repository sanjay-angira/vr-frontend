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
        // <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] xl:h-[650px]">
          <Image
            src={imageUrl}
            alt={heading}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        // </div>
      ) : null}
    </section>
  );
}
