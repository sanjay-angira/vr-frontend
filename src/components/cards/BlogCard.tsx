
interface BlogPost {
  id: number;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  href: string;
}


const BlogCard = ({ post }: { post: BlogPost }) => {
    return (
        <article key={post.id} className="blog-card">
              <img src={post.image} alt={post.title} className="blog-card-image" />

              <div className="blog-card-content">
                <div className="blog-card-meta">
                  <span className="blog-card-category">{post.category}</span>
                  <span className="blog-card-date">{post.date}</span>
                </div>

                <h3 className="blog-card-title">{post.title}</h3>
                <p className="blog-card-excerpt">{post.excerpt}</p>

                <a href={post.href} className="blog-read-more">
                  Read More <span aria-hidden>-&gt;</span>
                </a>
              </div>
            </article>
    );
}


export default BlogCard;