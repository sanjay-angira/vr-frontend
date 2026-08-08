import type { MetadataRoute } from "next";
import { getApiBaseUrl, getSiteUrl } from "@/lib/site";

/** Refresh sitemap about hourly so new products/blogs appear for crawlers. */
export const revalidate = 3600;

const FETCH_TIMEOUT_MS = 25_000;
const DEFAULT_PAGE_SIZE = 48;
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

type SitemapSlugRow = {
  slug?: unknown;
  lastModified?: unknown;
};

type SitemapApiPayload = {
  success?: boolean;
  data?: {
    products?: SitemapSlugRow[];
    blogs?: SitemapSlugRow[];
    categories?: SitemapSlugRow[];
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

function mapSlugRows(
  rows: SitemapSlugRow[] | undefined,
  slugKeys: string[] = ["slug"],
): SlugEntry[] {
  if (!Array.isArray(rows)) return [];

  const seen = new Set<string>();
  const out: SlugEntry[] = [];

  for (const row of rows) {
    let slug: string | null = null;
    for (const key of slugKeys) {
      slug = normalizeSlug((row as Record<string, unknown>)[key]);
      if (slug) break;
    }
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push({
      slug,
      lastModified: parseLastModified(row.lastModified),
    });
  }

  return out;
}

async function fetchJson<T>(
  path: string,
): Promise<{ data: T | null; error?: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const url = `${getApiBaseUrl()}/${path.replace(/^\//, "")}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      // Match route revalidate so sitemap can be generated/ISR'd without
      // throwing Dynamic server usage errors from cache: "no-store".
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return { data: null, error: `HTTP ${res.status} for ${url}` };
    }
    return { data: (await res.json()) as T };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown fetch error";
    return { data: null, error: `${message} (${url})` };
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
    const { data: payload, error } = await fetchJson<PaginatedRows>(
      `${options.endpoint}?${query.toString()}`,
    );

    if (!payload) {
      if (error) {
        console.error("[sitemap] Paginated fetch failed:", error);
      }
      break;
    }

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
  const safeSlug = slug
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${site}${path}/${safeSlug}`;
}

function toSitemapRoutes(
  site: string,
  path: string,
  items: SlugEntry[],
  now: Date,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
): MetadataRoute.Sitemap {
  return items.map((item) => ({
    url: toAbsolutePath(site, path, item.slug),
    lastModified: item.lastModified ?? now,
    changeFrequency,
    priority,
  }));
}

async function loadFromSitemapApi(): Promise<{
  products: SlugEntry[];
  blogs: SlugEntry[];
  categories: SlugEntry[];
} | null> {
  const { data: payload, error } =
    await fetchJson<SitemapApiPayload>("customer/sitemap");

  if (!payload?.data) {
    if (error) {
      console.error("[sitemap] Lightweight sitemap API failed:", error);
    }
    return null;
  }

  return {
    products: mapSlugRows(payload.data.products, ["slug"]),
    blogs: mapSlugRows(payload.data.blogs, ["slug"]),
    categories: mapSlugRows(payload.data.categories, ["slug"]),
  };
}

async function loadFromLegacyEndpoints(): Promise<{
  products: SlugEntry[];
  blogs: SlugEntry[];
  categories: SlugEntry[];
}> {
  const [products, blogs, categories] = await Promise.all([
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
    collectPaginatedSlugs({
      endpoint: "customer/categories",
      slugKeys: ["slug", "categorySlug"],
      dateKeys: ["updatedAt", "createdAt"],
      pageSize: DEFAULT_PAGE_SIZE,
    }),
  ]);

  return { products, blogs, categories };
}

/**
 * Dynamic sitemap for Google / Bing.
 * Prefers lightweight `customer/sitemap` (slugs only). Falls back to store/blog
 * list endpoints. Always returns at least static routes if the API is down.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const now = new Date();
  const staticRoutes = buildStaticRoutes(site, now);

  try {
    const fromApi = await loadFromSitemapApi();
    const sources =
      fromApi &&
      (fromApi.products.length > 0 ||
        fromApi.blogs.length > 0 ||
        fromApi.categories.length > 0)
        ? fromApi
        : await loadFromLegacyEndpoints();

    if (
      sources.products.length === 0 &&
      sources.blogs.length === 0 &&
      sources.categories.length === 0
    ) {
      console.error(
        "[sitemap] No dynamic slugs from API; serving static routes only.",
      );
      return staticRoutes;
    }

    return [
      ...staticRoutes,
      ...toSitemapRoutes(site, "/product", sources.products, now, "weekly", 0.8),
      ...toSitemapRoutes(
        site,
        "/category",
        sources.categories,
        now,
        "weekly",
        0.75,
      ),
      ...toSitemapRoutes(site, "/blog", sources.blogs, now, "weekly", 0.6),
    ];
  } catch (error) {
    console.error(
      "[sitemap] Failed to build dynamic entries; serving static routes only.",
      error,
    );
    return staticRoutes;
  }
}
