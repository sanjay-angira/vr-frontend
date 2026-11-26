import { Suspense } from "react";
import type { Metadata } from "next";
import { HomePageSkeleton } from "@/components/shared/HomePageSkeleton";
import HomePageContent from "./HomePageContent";
import { getStaticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getStaticPageMetadata("home");

export default function Page() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}
