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
  const [sectionsResult, bannersResult] = await Promise.allSettled([
    fetchHomepageSections(),
    fetchHomepageBanners(),
  ]);
  const sections =
    sectionsResult.status === "fulfilled" ? sectionsResult.value : [];
  const banners =
    bannersResult.status === "fulfilled" ? bannersResult.value : [];

  if (sectionsResult.status === "rejected") {
    console.error("Failed to load homepage sections:", sectionsResult.reason);
  }
  if (bannersResult.status === "rejected") {
    console.error("Failed to load homepage banners:", bannersResult.reason);
  }

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
      />
    </>
  );
}
