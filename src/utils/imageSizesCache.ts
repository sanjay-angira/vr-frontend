import type { OptimizedImageColumns } from "./optimizedImage";

/** In-memory map of original URL → flat optimized columns (session-scoped). */
const imageColumnsByUrl = new Map<string, OptimizedImageColumns>();

export function rememberImageSizes(
  url: string | null | undefined,
  columns?: OptimizedImageColumns | null
): void {
  const key = url?.trim();
  if (!key) return;
  if (columns && (columns.originalUrl || columns.webp400 || columns.webp800)) {
    imageColumnsByUrl.set(key, columns);
  }
}

export function getRememberedImageSizes(
  url: string | null | undefined
): OptimizedImageColumns | null {
  const key = url?.trim();
  if (!key) return null;
  return imageColumnsByUrl.get(key) ?? null;
}

export function forgetImageSizes(url: string | null | undefined): void {
  const key = url?.trim();
  if (!key) return;
  imageColumnsByUrl.delete(key);
}

/** Alias helpers with clearer names. */
export const rememberImageColumns = rememberImageSizes;
export const getRememberedImageColumns = getRememberedImageSizes;
export const forgetImageColumns = forgetImageSizes;
