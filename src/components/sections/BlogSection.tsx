import BlogCard from "../cards/BlogCard";
import SectionHeading from "../utilis/SectionHeadings";

type BlogPost = {
  id: number;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  href: string;
};

interface BlogSectionProps {
  posts: BlogPost[];
  title: string;
  subtitle?: string;
}

const BlogSection = ({ posts, title, subtitle }: BlogSectionProps) => {
  return (
    <section className="section blog-section">
      <div className="container">
        {/* <div className="blog-section-header">
          <p className="blog-section-kicker">From The Kitchen</p>
          <h2 className="blog-section-title">Our Blog</h2>
        </div> */}
        <SectionHeading
          title={title}
          subtitle={subtitle}
        />
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
};

export default BlogSection;
