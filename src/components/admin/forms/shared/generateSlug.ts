export function generateSlug(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function buildVariantSlug(productSlug: string, variantName: string): string {
  const nameSlug = generateSlug(variantName);
  const prefix = productSlug.trim();
  if (!nameSlug) {
    return prefix;
  }
  return prefix ? `${prefix}-${nameSlug}` : nameSlug;
}
