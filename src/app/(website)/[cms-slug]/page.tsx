import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/website/seo/JsonLd";
import { fetchCmsPageBySlug } from "@/services/website/cmsPageService";
import {
  DEFAULT_SITE_FAQS,
  getBreadcrumbSchema,
  getFaqPageSchema,
  getWebPageSchema,
} from "@/lib/schema";
import {
  SEO_PAGES,
  getCmsPageMetadata,
  getCmsSeoKey,
} from "@/lib/seo";

type PageProps = {
  params: Promise<{ "cms-slug": string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { "cms-slug": slug } = await params;
  const mapped = getCmsPageMetadata(slug);
  if (mapped) return mapped;

  const page = await fetchCmsPageBySlug(slug);
  if (!page) {
    return { title: "Page not found | Vrindavan Rasa" };
  }

  return (
    getCmsPageMetadata(slug, page.title) || {
      title: `${page.title} | Vrindavan Rasa`,
    }
  );
}

export default async function CmsPageRoute({ params }: PageProps) {
  const { "cms-slug": slug } = await params;
  const page = await fetchCmsPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const normalizedSlug = slug.trim().toLowerCase();
  const path = `/${normalizedSlug}`;
  const seoKey = getCmsSeoKey(normalizedSlug);
  const seoEntry = seoKey ? SEO_PAGES[seoKey] : null;
  const pageName = seoEntry?.title.replace(/\s*\|\s*Vrindavan Rasa\s*$/i, "").trim() || page.title;
  const description = seoEntry?.description;

  const schemas: Array<Record<string, unknown>> = [
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: pageName, path },
    ]),
  ];

  if (seoKey === "faq") {
    const faqSchema = getFaqPageSchema(DEFAULT_SITE_FAQS);
    if (faqSchema) schemas.unshift(faqSchema);
  } else {
    schemas.unshift(
      getWebPageSchema({
        name: pageName,
        path,
        description,
      })
    );
  }

  return (
    <>
      <JsonLd data={schemas} />
      <div className="container cms-page-shell">
        <header className="cms-page-header">
          <h1 className="cms-page-title">{page.title}</h1>
        </header>
        <div
          className="cms-page-content rich-html"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </>
  );
}
