import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCmsPageBySlug } from "@/services/website/cmsPageService";

type PageProps = {
  params: Promise<{ "cms-slug": string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { "cms-slug": slug } = await params;
  const page = await fetchCmsPageBySlug(slug);

  if (!page) {
    return { title: "Page not found | Vrindavan Rasa" };
  }

  return {
    title: `${page.title} | Vrindavan Rasa`,
  };
}

export default async function CmsPageRoute({ params }: PageProps) {
  const { "cms-slug": slug } = await params;
  const page = await fetchCmsPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="container cms-page-shell">
      <header className="cms-page-header">
        <h1 className="cms-page-title">{page.title}</h1>
      </header>
      <div
        className="cms-page-content rich-html"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
