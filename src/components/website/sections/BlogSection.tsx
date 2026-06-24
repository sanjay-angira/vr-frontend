import Link from "next/link";
import { SectionHeading } from "@/components/website/shared/SectionHeading";

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
      <img src={post.image} alt={post.title} className="blog-card-image" />
      <div className="blog-card-content">
        <div className="blog-card-meta">
          <span className="blog-card-category">{post.category}</span>
          <span className="blog-card-date">{post.date}</span>
        </div>
        <h3 className="blog-card-title">{post.title}</h3>
        <p className="blog-card-excerpt">{post.excerpt}</p>
        <Link href={post.href} className="blog-read-more">
          Read More <span aria-hidden>-&gt;</span>
        </Link>
      </div>
    </article>
  );
}

export function BlogSection({
  posts,
  title,
  subtitle,
}: {
  posts: BlogPost[];
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="section blog-section">
      <div className="container">
        <SectionHeading title={title} subtitle={subtitle} />
        <div className="blog-grid">
          {posts.map((post) => (
            <div key={post.id} className="blog-card-wrapper">
              <BlogCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
