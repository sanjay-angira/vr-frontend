import Image from "next/image";
import Link from "next/link";
import {
  SectionHeading,
  type SectionHeadingProps,
} from "@/components/website/shared/SectionHeading";

type BlogPost = {
  id: number;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  href: string;
};

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="blog-card">
      <div className="blog-card-media">
        {post.image ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="blog-card-image"
          />
        ) : (
          <div className="blog-card-image blog-card-image--placeholder" />
        )}
      </div>
      <div className="blog-card-content">
        <div className="blog-card-meta">
          {post.category ? <span className="blog-card-category">{post.category}</span> : null}
          {post.date ? <span className="blog-card-date">{post.date}</span> : null}
        </div>
        <h3 className="blog-card-title">{post.title}</h3>
        {post.excerpt ? <p className="blog-card-excerpt">{post.excerpt}</p> : null}
        <Link href={post.href} className="blog-read-more">
          Read More <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}

export function BlogSection({
  posts,
  heading,
  viewAllLink = "/blogs",
}: {
  posts: BlogPost[];
  heading: SectionHeadingProps;
  viewAllLink?: string;
}) {
  return (
    <section className="section home-section blog-section">
      <div className="container">
        <SectionHeading {...heading} />
        <div className="blog-grid">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
        {viewAllLink ? (
          <div className="home-section__actions">
            <Link href={viewAllLink} className="btn btn-outline btn-lg">
              View All Articles
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
