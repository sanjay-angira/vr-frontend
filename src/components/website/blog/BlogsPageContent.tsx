"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import {
  fetchBlogFilters,
  fetchBlogs,
  type BlogCategoryOption,
  type BlogListCard,
} from "@/components/website/blog/blogApi";

function BlogCard({ post }: { post: BlogListCard }) {
  return (
    <article className="blog-card">
      <Link href={post.href} className="blog-card-media">
        {post.image ? (
          <Image
            src={post.image}
            alt={post.imageAlt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="blog-card-image"
          />
        ) : (
          <div className="blog-card-image blog-card-image--placeholder" aria-hidden />
        )}
      </Link>
      <div className="blog-card-content">
        <div className="blog-card-meta">
          <span className="blog-card-category">{post.category}</span>
          {post.date && <span className="blog-card-date">{post.date}</span>}
        </div>
        <h2 className="blog-card-title">
          <Link href={post.href}>{post.title}</Link>
        </h2>
        {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
        <div className="blog-card-footer">
          {post.readingTime > 0 && (
            <span className="blog-card-reading">{post.readingTime} min read</span>
          )}
          <Link href={post.href} className="blog-read-more">
            Read More <span aria-hidden>-&gt;</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function BlogsPageContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [posts, setPosts] = useState<BlogListCard[]>([]);
  const [categories, setCategories] = useState<BlogCategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categorySlug, setCategorySlug] = useState(initialCategory);
  const [pageNumber, setPageNumber] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 12;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(count / pageSize)),
    [count, pageSize]
  );

  useEffect(() => {
    setCategorySlug(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    fetchBlogFilters().then(setCategories);
  }, []);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await fetchBlogs({
        pageNumber,
        pageSize,
        search,
        categorySlug: categorySlug || undefined,
      });
      setPosts(result.rows);
      setCount(result.count);
    } catch (err: unknown) {
      setPosts([]);
      setCount(0);
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Unable to load blogs."
      );
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, search, categorySlug]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setPageNumber(1);
    setSearch(searchInput.trim());
  };

  return (
    <section className="blogs-page">
      <div className="container blogs-page__inner">
        <header className="blogs-page__hero">
          <p className="blogs-page__eyebrow">Stories &amp; Rituals</p>
          <h1 className="blogs-page__title">Our Blog</h1>
          <p className="blogs-page__subtitle">
            Explore devotion, tradition, and everyday rasa through our latest writings.
          </p>
        </header>

        <div className="blogs-page__toolbar">
          <form className="blogs-page__search" onSubmit={handleSearch}>
            <Search size={18} aria-hidden />
            <input
              type="search"
              placeholder="Search articles..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <button type="submit" className="btn btn-outline btn-sm">
              Search
            </button>
          </form>

          {categories.length > 0 && (
            <div className="blogs-page__categories" role="tablist" aria-label="Blog categories">
              <button
                type="button"
                className={`blogs-page__chip${!categorySlug ? " is-active" : ""}`}
                onClick={() => {
                  setCategorySlug("");
                  setPageNumber(1);
                }}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`blogs-page__chip${
                    categorySlug === category.slug ? " is-active" : ""
                  }`}
                  onClick={() => {
                    setCategorySlug(category.slug);
                    setPageNumber(1);
                  }}
                >
                  {category.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="blogs-page__count">
          {loading ? "Loading…" : `${count} article${count === 1 ? "" : "s"}`}
        </p>

        {loading && (
          <div className="blog-grid" aria-busy="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="blog-skeleton" key={`blog-skel-${index}`}>
                <div className="blog-skeleton__image" />
                <div className="blog-skeleton__line" />
                <div className="blog-skeleton__line blog-skeleton__line--short" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="blogs-page__message blogs-page__message--error">{error}</p>
        )}

        {!loading && !error && posts.length === 0 && (
          <p className="blogs-page__message">
            No articles found. Try another search or category.
          </p>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="blog-grid">
            {posts.map((post) => (
              <div key={post.id} className="blog-card-wrapper">
                <BlogCard post={post} />
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="blogs-page__pagination">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={pageNumber <= 1 || loading}
              onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <span>
              Page {pageNumber} of {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={pageNumber >= totalPages || loading}
              onClick={() => setPageNumber((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
