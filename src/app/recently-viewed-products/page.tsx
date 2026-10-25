import type { Metadata } from "next";
import { RecentlyViewedPageContent } from "@/components/website/sections/RecentlyViewedPageContent";
import { NOINDEX_ROBOTS, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Recently Viewed | Vrindavan Rasa",
  description: "Products you recently viewed on Vrindavan Rasa.",
  path: "/recently-viewed-products",
  robots: NOINDEX_ROBOTS,
});

export default function RecentlyViewedProductsPage() {
  return <RecentlyViewedPageContent />;
}
