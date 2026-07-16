import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogDetailContent } from "@/components/website/blog/BlogDetailContent";
import { fetchBlogBySlug } from "@/components/website/blog/blogApi";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await fetchBlogBySlug(slug);
  if (!blog) {
    return { title: "Blog | Vrindavan Rasa" };
  }

  const title = blog.seo?.metaTitle || `${blog.title} | Vrindavan Rasa`;
  const description =
    blog.seo?.metaDescription || blog.excerpt || "Read this article on Vrindavan Rasa.";

  return {
    title,
    description,
    openGraph: {
      title: blog.seo?.ogTitle || title,
      description: blog.seo?.ogDescription || description,
      images: blog.seo?.ogImage || blog.image ? [blog.seo?.ogImage || blog.image] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = await fetchBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  return <BlogDetailContent blog={blog} />;
}
