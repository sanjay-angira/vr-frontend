export function resolveImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;

  
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/backend\/api\/?$/, "") ?? "";
  return trimmed.startsWith("/") ? `${apiBase}${trimmed}` : `${apiBase}/${trimmed}`;
}
