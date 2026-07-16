import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogsPageContent } from "@/components/website/blog/BlogsPageContent";

export const metadata: Metadata = {
  title: "Blog | Vrindavan Rasa",
  description: "Read stories, rituals, and insights from Vrindavan Rasa.",
};

export default function BlogsPage() {
  return (
    <Suspense fallback={<section className="blogs-page" aria-busy="true" />}>
      <BlogsPageContent />
    </Suspense>
  );
}
