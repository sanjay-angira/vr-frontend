import type { AdminModuleKey } from "@/components/admin/commonTable/adminModuleTable.config";

/** Modules with a dedicated read-only view page */
export const ADMIN_VIEW_MODULES = [
  "cms-pages",
] as const satisfies readonly AdminModuleKey[];

const adminViewModuleSet = new Set<string>(ADMIN_VIEW_MODULES);

export function hasAdminView(module: string): boolean {
  return adminViewModuleSet.has(module);
}
