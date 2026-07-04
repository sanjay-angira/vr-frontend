export function getRowDisplayName(row: object): string | undefined {
  const record = row as Record<string, unknown>;
  const keys = [
    "productName",
    "name",
    "title",
    "categoryName",
    "brandName",
    "tagName",
    "offerName",
    "firstName",
    "roleName",
    "question",
    "couponCode",
    "label",
    "email",
  ];

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}
