import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogsPageContent } from "@/components/website/blog/BlogsPageContent";
import { JsonLd } from "@/components/website/seo/JsonLd";
import { getBlogListingSchema, getBreadcrumbSchema } from "@/lib/schema";
import { getStaticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getStaticPageMetadata("blog");

export default function BlogsPage() {
  return (
    <>
      <JsonLd
        data={[
          getBlogListingSchema(),
          getBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blogs" },
          ]),
        ]}
      />
      <Suspense fallback={<section className="blogs-page" aria-busy="true" />}>
        <BlogsPageContent />
      </Suspense>
    </>
  );
}
