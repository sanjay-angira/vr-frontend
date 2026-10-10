
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.vrindavanrasa.com";
  const normalized = raw.replace(/\/+$/, "");
  try {
    const url = new URL(normalized);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "https://www.vrindavanrasa.com";
    }
    return `${url.protocol}//${url.host}`;
  } catch {
    return "https://www.vrindavanrasa.com";
  }
}

export function getSiteName(): string {
  return "Vrindavan Rasa";
} 

export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim() || "https://api.vrindavanrasa.com/backend/api";
  const normalized = raw.replace(/\/+$/, "");
  try {
    new URL(normalized);
    return normalized;
  } catch {
    return "https://api.vrindavanrasa.com/backend/api";
  }
}
