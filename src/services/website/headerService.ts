import type {
  WebsiteHeaderApiResponse,
  WebsiteHeaderData,
} from "@/types/header";
import { DEFAULT_WEBSITE_HEADER as FALLBACK } from "@/types/header";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchWebsiteHeader(): Promise<WebsiteHeaderData> {
  if (!API_BASE_URL) {
    return FALLBACK;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/website/header`, {
      next: { revalidate: 60 },
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return FALLBACK;
    }

    const json = (await response.json()) as WebsiteHeaderApiResponse;
    if (json?.success && json?.data) {
      return json.data;
    }
  } catch {
    return FALLBACK;
  }

  return FALLBACK;
}

export { FALLBACK as getFallbackWebsiteHeader };
