import type { AdminModuleKey } from "@/components/admin/commonTable/adminModuleTable.config";

/** Modules with add/edit forms — safe to import from Server Components */
export const ADMIN_FORM_MODULES = [
  "products",
  "categories",
  "brands",
  "attributes",
  "offers",
  "coupons",
  "banners",
  "blogs",
  "blog-categories",
  "blog-tags",
  "reviews",
  "product-reviews",
  "product-faq",
  "cms-pages",
  "users",
  "customers",
] as const satisfies readonly AdminModuleKey[];

const adminFormModuleSet = new Set<string>(ADMIN_FORM_MODULES);

export function hasAdminForm(module: string): boolean {
  return adminFormModuleSet.has(module);
}
