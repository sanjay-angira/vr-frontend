import { getAdminModuleTableConfig } from "@/components/admin/commonTable/adminModuleTable.config";

/** Modules whose table config includes a view action */
export function hasAdminView(module: string): boolean {
  const config = getAdminModuleTableConfig(module);
  return Boolean(config?.actions.includes("view"));
}
