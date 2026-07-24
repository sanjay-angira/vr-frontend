/**
 * Canonical public site origin for SEO (sitemap, robots, absolute URLs).
 */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    "https://vrindavanrasa.com";

  return raw.replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "https://api.vrindavanrasa.com/backend/api";

  return raw.replace(/\/+$/, "");
}
