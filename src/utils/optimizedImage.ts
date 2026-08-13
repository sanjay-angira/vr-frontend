export type OptimizedImageColumns = {
  originalUrl?: string | null;
  webp400?: string | null;
  webp800?: string | null;
  webp1200?: string | null;
  webp1440?: string | null;
  webp1920?: string | null;
};

export type ImageOptimizationType =
  | "product"
  | "category"
  | "blog"
  | "banner"
  | "banner_mobile";

export type OptimizedImageSource = OptimizedImageColumns & {
  url?: string | null;
  image?: string | null;
  /** @deprecated nested sizes — ignored; prefer flat columns */
  sizes?: unknown;
  imageSizes?: unknown;
};

const WIDTHS = [400, 800, 1200, 1440, 1920] as const;

export type GetOptimizedImageOptions = {
  /** Never return a non-WebP original; empty string if no WebP is available. */
  webpOnly?: boolean;
};

function isWebpUrl(url: string): boolean {
  return /\.webp(\?|#|$)/i.test(url.trim());
}

/**
 * Pick the best WebP URL for a preferred display width from flat columns.
 * Falls back to the original image when sized WebP variants are missing (unless webpOnly).
 */
export function getOptimizedImageUrl(
  source: string | OptimizedImageSource | null | undefined,
  preferredWidth: number,
  options?: GetOptimizedImageOptions
): string {
  if (!source) return "";

  if (typeof source === "string") {
    const url = source.trim();
    if (options?.webpOnly && url && !isWebpUrl(url)) return "";
    return url;
  }

  const original = (source.originalUrl || source.url || source.image || "").trim();

  const available = WIDTHS.filter((width) => {
    const webp = source[`webp${width}` as keyof OptimizedImageSource];
    return Boolean(webp);
  });

  if (!available.length) {
    if (options?.webpOnly) {
      return isWebpUrl(original) ? original : "";
    }
    return original;
  }

  const bestWidth =
    available.find((w) => w >= preferredWidth) ??
    available[available.length - 1];

  const preferred = source[`webp${bestWidth}` as keyof OptimizedImageSource];
  const webpUrl = String(preferred || "").trim();
  if (webpUrl) return webpUrl;

  if (options?.webpOnly) {
    return isWebpUrl(original) ? original : "";
  }
  return original;
}

/** Website product cards / PDP — WebP sized variants only. */
export function getProductWebpImageUrl(
  source: string | OptimizedImageSource | null | undefined,
  preferredWidth: number
): string {
  return getOptimizedImageUrl(source, preferredWidth, { webpOnly: true });
}

/** Extract flat columns from an upload API result. */
export function columnsFromUploadResult(
  result: OptimizedImageColumns & { Location?: string; original?: string }
): OptimizedImageColumns {
  return {
    originalUrl: result.originalUrl || result.original || result.Location || "",
    webp400: result.webp400 ?? null,
    webp800: result.webp800 ?? null,
    webp1200: result.webp1200 ?? null,
    webp1440: result.webp1440 ?? null,
    webp1920: result.webp1920 ?? null,
  };
}
