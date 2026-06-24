import { icons, type LucideIcon } from "lucide-react";
import { Circle } from "lucide-react";

/** Maps legacy short keys to Lucide icon names. */
const legacyIconAliases: Record<string, string> = {
  dashboard: "layout-dashboard",
  products: "package",
  "products-tag": "tags",
  categories: "layout-grid",
  brands: "award",
  attributes: "sliders-horizontal",
  "attributes-options": "list-checks",
  "offers-and-deals": "percent",
  coupons: "ticket",
  banners: "image",
  cms: "file-text",
  "blog-posts": "newspaper",
  "blog-categories": "folder-tree",
  "blog-tags": "hash",
  reviews: "star",
  "header-settings": "panel-top",
  "footer-settings": "panel-bottom",
  "website-layout": "layout-template",
  customers: "users",
  "delete-requests": "user-x",
  "product-reviews": "message-square-text",
  "product-faq": "circle-help",
  "product-questions": "message-circle-question",
  "contact-us-leads": "mail",
  orders: "clipboard-list",
  inventory: "warehouse",
  payments: "credit-card",
  shipping: "truck",
  settings: "settings",
};

function toPascalCase(value: string): string {
  return value
    .trim()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

function normalizeIconName(value: string): string {
  const trimmed = value.trim().toLowerCase();
  return legacyIconAliases[trimmed] ?? trimmed;
}

/**
 * Resolve any icon name from the database to a Lucide component.
 * DB can store: "package", "layout-dashboard", "Package", "LayoutDashboard"
 */
export function resolveLucideIcon(name: string): LucideIcon {
  if (!name?.trim()) {
    return Circle;
  }

  const normalized = normalizeIconName(name);
  const pascalName = toPascalCase(normalized);
  const Icon = icons[pascalName as keyof typeof icons];

  return Icon ?? Circle;
}

/** List of common admin menu icon names for DB/admin UI reference. */
export const suggestedAdminMenuIcons = [
  "layout-dashboard",
  "package",
  "layout-grid",
  "tag",
  "clipboard-list",
  "users",
  "ticket",
  "warehouse",
  "credit-card",
  "truck",
  "star",
  "image",
  "file-text",
  "settings",
  "chart-bar",
  "bell",
  "mail",
  "shield",
  "store",
  "percent",
] as const;
