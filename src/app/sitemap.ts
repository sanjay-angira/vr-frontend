import type { MetadataRoute } from "next";
import { getApiBaseUrl, getSiteUrl } from "@/lib/site";

/** Refresh sitemap about hourly so new products/blogs appear for crawlers. */
export const revalidate = 3600;

const FETCH_TIMEOUT_MS = 8_000;
const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_MAX_PAGES = 50;

type PaginatedRows = {
  success?: boolean;
  data?: {
    rows?: Array<Record<string, unknown>>;
    count?: number;
    pageNumber?: number;
    pageSize?: number;
  };
};

type SlugEntry = { slug: string; lastModified?: Date };

function buildStaticRoutes(site: string, now: Date): MetadataRoute.Sitemap {
  return [
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
}

/** Accept ISO / Date only — skip display strings like "22 Feb 2026". */
function parseLastModified(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  // Prefer unambiguous ISO-like values; reject human display dates.
  const looksIso =
    /^\d{4}-\d{2}-\d{2}/.test(trimmed) || /^\d{4}\/\d{2}\/\d{2}/.test(trimmed);
  if (!looksIso) return undefined;

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function normalizeSlug(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const slug = value.trim().replace(/^\/+|\/+$/g, "");
  if (!slug || /[\s?#]/.test(slug)) return null;
  return slug;
}

async function fetchJson<T>(path: string): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${getApiBaseUrl()}/${path.replace(/^\//, "")}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function collectPaginatedSlugs(options: {
  endpoint: string;
  slugKeys: string[];
  dateKeys?: string[];
  pageSize?: number;
  maxPages?: number;
}): Promise<SlugEntry[]> {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;
  const dateKeys = options.dateKeys ?? ["updatedAt", "createdAt"];
  const seen = new Set<string>();
  const out: SlugEntry[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const query = new URLSearchParams({
      pageNumber: String(page),
      pageSize: String(pageSize),
    });
    const payload = await fetchJson<PaginatedRows>(
      `${options.endpoint}?${query.toString()}`,
    );

    // Null payload usually means timeout / API down — stop early.
    if (!payload) break;

    const rows = Array.isArray(payload.data?.rows) ? payload.data.rows : [];
    if (rows.length === 0) break;

    for (const row of rows) {
      let slug: string | null = null;
      for (const key of options.slugKeys) {
        slug = normalizeSlug(row[key]);
        if (slug) break;
      }
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);

      let lastModified: Date | undefined;
      for (const key of dateKeys) {
        lastModified = parseLastModified(row[key]);
        if (lastModified) break;
      }

      out.push({ slug, lastModified });
    }

    const count = Number(payload.data?.count ?? 0);
    if (
      (Number.isFinite(count) && count > 0 && page * pageSize >= count) ||
      rows.length < pageSize
    ) {
      break;
    }
  }

  return out;
}

function toAbsolutePath(site: string, path: string, slug: string): string {
  // Keep path separators readable; encode only unsafe characters per segment.
  const safeSlug = slug
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${site}${path}/${safeSlug}`;
}

/**
 * Dynamic sitemap for Google / Bing.
 * Always returns at least static routes so /sitemap.xml never 500s when the API is slow or down.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const now = new Date();
  const staticRoutes = buildStaticRoutes(site, now);

  try {
    const [products, blogs] = await Promise.all([
      collectPaginatedSlugs({
        endpoint: "customer/all-products",
        slugKeys: ["productSlug"],
        dateKeys: ["updatedAt", "createdAt"],
        pageSize: DEFAULT_PAGE_SIZE,
      }),
      collectPaginatedSlugs({
        endpoint: "customer/blogs",
        slugKeys: ["slug"],
        dateKeys: ["updatedAt", "createdAt", "publishedAt"],
        pageSize: DEFAULT_PAGE_SIZE,
      }),
    ]);

    const productRoutes: MetadataRoute.Sitemap = products.map((item) => ({
      url: toAbsolutePath(site, "/product", item.slug),
      lastModified: item.lastModified ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const blogRoutes: MetadataRoute.Sitemap = blogs.map((item) => ({
      url: toAbsolutePath(site, "/blog", item.slug),
      lastModified: item.lastModified ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...productRoutes, ...blogRoutes];
  } catch (error) {
    console.error("[sitemap] Failed to build dynamic entries; serving static routes only.", error);
    return staticRoutes;
  }
}
