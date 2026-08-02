import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogDetailContent } from "@/components/website/blog/BlogDetailContent";
import { JsonLd } from "@/components/website/seo/JsonLd";
import { fetchBlogBySlug } from "@/components/website/blog/blogApi";
import {
  getBlogPostingSchema,
  getBreadcrumbSchema,
  getFaqPageSchema,
} from "@/lib/schema";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await fetchBlogBySlug(slug);
  if (!blog) {
    return { title: "Blog | Vrindavan Rasa" };
  }

  const title = blog.seo?.metaTitle || `${blog.title} | Vrindavan Rasa`;
  const description =
    blog.seo?.metaDescription ||
    blog.excerpt ||
    "Read this article on Vrindavan Rasa.";

  return buildPageMetadata({
    title,
    description,
    path: `/blog/${slug}`,
    image: blog.seo?.ogImage || blog.image,
    type: "article",
  });
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = await fetchBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const path = `/blog/${blog.slug || slug}`;
  const schemas: Array<Record<string, unknown>> = [
    getBlogPostingSchema({
      title: blog.title,
      description: blog.seo?.metaDescription || blog.excerpt || undefined,
      image: blog.seo?.ogImage || blog.image,
      path,
      datePublished: blog.date || undefined,
    }),
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blogs" },
      { name: blog.title, path },
    ]),
  ];

  const faqSchema = getFaqPageSchema(blog.faqs || []);
  if (faqSchema) schemas.push(faqSchema);

  return (
    <>
      <JsonLd data={schemas} />
      <BlogDetailContent blog={blog} />
    </>
  );
}
