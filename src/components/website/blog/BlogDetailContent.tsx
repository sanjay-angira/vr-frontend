import Link from "next/link";
import { Accordion } from "@/components/website/shared/Accordion";
import { ScrollToTopOnMount } from "@/components/website/shared/ScrollToTopOnMount";
import type { BlogDetail, BlogListCard } from "@/components/website/blog/blogApi";

function RelatedCard({ post }: { post: BlogListCard }) {
  return (
    <article className="blog-card">
      <Link href={post.href} className="blog-card-media">
        {post.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image} alt={post.imageAlt || post.title} className="blog-card-image" />
        ) : (
          <div className="blog-card-image blog-card-image--placeholder" aria-hidden />
        )}
      </Link>
      <div className="blog-card-content">
        <div className="blog-card-meta">
          <span className="blog-card-category">{post.category}</span>
          {post.date && <span className="blog-card-date">{post.date}</span>}
        </div>
        <h3 className="blog-card-title">
          <Link href={post.href}>{post.title}</Link>
        </h3>
        {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
        <Link href={post.href} className="blog-read-more">
          Read More <span aria-hidden>-&gt;</span>
        </Link>
      </div>
    </article>
  );
}

export function BlogDetailContent({ blog }: { blog: BlogDetail }) {
  const faqItems = blog.faqs
    .filter((item) => item.question?.trim() && item.answer?.trim())
    .map((item, index) => ({
      id: `blog-faq-${index}`,
      question: item.question,
      answer: item.answer,
    }));

  return (
    <article className="blog-detail">
      <ScrollToTopOnMount />
      <div className="container blog-detail__inner">
        <nav className="blog-detail__breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>›</span>
          <Link href="/blogs">Blog</Link>
          <span>›</span>
          <span>{blog.title}</span>
        </nav>

        <header className="blog-detail__header">
          {blog.category && (
            <Link
              href={`/blogs?category=${encodeURIComponent(blog.category.slug)}`}
              className="blog-detail__category"
            >
              {blog.category.title}
            </Link>
          )}
          <h1 className="blog-detail__title">{blog.title}</h1>
          {blog.excerpt && <p className="blog-detail__excerpt">{blog.excerpt}</p>}
          <div className="blog-detail__meta">
            {blog.date && <span>{blog.date}</span>}
            {blog.readingTime > 0 && <span>{blog.readingTime} min read</span>}
            {blog.tags.length > 0 && (
              <div className="blog-detail__tags">
                {blog.tags.map((tag) => (
                  <span key={tag.id} className="blog-detail__tag">
                    {tag.title}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {blog.image && (
          <div className="blog-detail__hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={blog.image} alt={blog.imageAlt || blog.title} />
          </div>
        )}

        <div
          className="blog-detail__content rich-html"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {faqItems.length > 0 && (
          <section className="blog-detail__faqs">
            <h2>Frequently Asked Questions</h2>
            <Accordion items={faqItems} />
          </section>
        )}

        {blog.related.length > 0 && (
          <section className="blog-detail__related">
            <h2>Related Articles</h2>
            <div className="blog-grid">
              {blog.related.map((post) => (
                <div key={post.id} className="blog-card-wrapper">
                  <RelatedCard post={post} />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="blog-detail__back">
          <Link href="/blogs" className="btn btn-outline">
            ← Back to all articles
          </Link>
        </div>
      </div>
    </article>
  );
}
