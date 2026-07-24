import type { MetadataRoute } from "next";
import { getApiBaseUrl, getSiteUrl } from "@/lib/site";

/** Refresh sitemap about hourly so new products/blogs appear for crawlers. */
export const revalidate = 3600;

type PaginatedRows = {
  success?: boolean;
  data?: {
    rows?: Array<Record<string, unknown>>;
    count?: number;
    pageNumber?: number;
    pageSize?: number;
  };
};

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/${path.replace(/^\//, "")}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function collectPaginatedSlugs(options: {
  endpoint: string;
  slugKeys: string[];
  pageSize?: number;
  maxPages?: number;
}): Promise<Array<{ slug: string; lastModified?: Date }>> {
  const pageSize = options.pageSize ?? 100;
  const maxPages = options.maxPages ?? 50;
  const seen = new Set<string>();
  const out: Array<{ slug: string; lastModified?: Date }> = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const query = new URLSearchParams({
      pageNumber: String(page),
      pageSize: String(pageSize),
    });
    const payload = await fetchJson<PaginatedRows>(
      `${options.endpoint}?${query.toString()}`,
    );
    const rows = payload?.data?.rows ?? [];
    if (rows.length === 0) break;

    for (const row of rows) {
      let slug = "";
      for (const key of options.slugKeys) {
        const value = row[key];
        if (typeof value === "string" && value.trim()) {
          slug = value.trim();
          break;
        }
      }
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);

      const updatedAt = row.updatedAt ?? row.createdAt ?? row.date;
      const lastModified =
        typeof updatedAt === "string" || updatedAt instanceof Date
          ? new Date(updatedAt)
          : undefined;

      out.push({
        slug,
        lastModified:
          lastModified && !Number.isNaN(lastModified.getTime())
            ? lastModified
            : undefined,
      });
    }

    const count = Number(payload?.data?.count ?? 0);
    if (page * pageSize >= count || rows.length < pageSize) break;
  }

  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: site,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${site}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${site}/categories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${site}/blogs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${site}/contact-us`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const [products, blogs] = await Promise.all([
    collectPaginatedSlugs({
      endpoint: "customer/all-products",
      slugKeys: ["productSlug"],
      pageSize: 100,
    }),
    collectPaginatedSlugs({
      endpoint: "customer/blogs",
      slugKeys: ["slug"],
      pageSize: 100,
    }),
  ]);

  const productRoutes: MetadataRoute.Sitemap = products.map((item) => ({
    url: `${site}/product/${encodeURIComponent(item.slug)}`,
    lastModified: item.lastModified ?? now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogs.map((item) => ({
    url: `${site}/blog/${encodeURIComponent(item.slug)}`,
    lastModified: item.lastModified ?? now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
