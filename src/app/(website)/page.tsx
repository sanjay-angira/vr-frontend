import { Suspense } from "react";
import type { Metadata } from "next";
import { HomePageSkeleton } from "@/components/website/shared/HomePageSkeleton";
import { HomePageSections } from "@/components/website/home/HomePageSections";
import { JsonLd } from "@/components/website/seo/JsonLd";
import {
  fetchHomepageBanners,
  fetchHomepageSections,
} from "@/services/website/homepageService";
import { getWebSiteSchema } from "@/lib/schema";
import { getStaticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getStaticPageMetadata("home");

export default function Page() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}

async function HomePageContent() {
  const [sections, banners] = await Promise.all([
    fetchHomepageSections(),
    fetchHomepageBanners(),
  ]);
  const websiteLd = getWebSiteSchema();

  if (sections.length === 0 && banners.length === 0) {
    return (
      <>
        <JsonLd data={websiteLd} />
        <div className="container home-empty">
          <p className="home-empty__message">
            Homepage content is not available yet.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <JsonLd data={websiteLd} />
      <HomePageSections
        sections={sections}
        banners={banners}
        bannerEffect={
          sections.find((section) => section.type === "hero_banner")?.data
            ?.bannerEffect
        }
      />
    </>
  );
}
