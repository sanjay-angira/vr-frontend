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

/**
 * Pick the best WebP URL for a preferred display width from flat columns.
 * Falls back to the original image when sized WebP variants are missing.
 */
export function getOptimizedImageUrl(
  source: string | OptimizedImageSource | null | undefined,
  preferredWidth: number
): string {
  if (!source) return "";

  if (typeof source === "string") {
    return source.trim();
  }

  const original = (source.originalUrl || source.url || source.image || "").trim();

  const available = WIDTHS.filter((width) => {
    const webp = source[`webp${width}` as keyof OptimizedImageSource];
    return Boolean(webp);
  });

  if (!available.length) return original;

  const bestWidth =
    available.find((w) => w >= preferredWidth) ??
    available[available.length - 1];

  const preferred = source[`webp${bestWidth}` as keyof OptimizedImageSource];
  return String(preferred || original).trim();
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
