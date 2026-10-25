import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { getData } from "@/services/api/apiService";

export type WebsiteCmsPage = {
  id: number;
  title: string;
  slug: string;
  content: string;
  isActive: boolean;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

/**
 * Fetches a public CMS page by slug.
 * Returns null when the page does not exist or is inactive
 * (backend `GET cms-pages/slug/:slug` uses publicOnly=true).
 */
export async function fetchCmsPageBySlug(
  slug: string,
): Promise<WebsiteCmsPage | null> {
  const trimmed = slug?.trim();
  if (!trimmed) return null;

  try {
    const response = (await getData(
      API_ENDPOINTS.CMS_PAGES.BY_SLUG(trimmed),
      undefined,
      { auth: false },
    )) as ApiEnvelope<Record<string, unknown>>;

    if (response?.success === false || !response?.data) {
      return null;
    }

    const data = response.data;
    const id = Number(data.id);
    const pageSlug = String(data.slug || "").trim();
    const title = String(data.title || "").trim();
    const isActive = data.isActive !== false;

    if (!Number.isFinite(id) || id <= 0 || !pageSlug || !isActive) {
      return null;
    }

    return {
      id,
      title: title || pageSlug,
      slug: pageSlug,
      content: String(data.content || ""),
      isActive,
    };
  } catch {
    return null;
  }
}
