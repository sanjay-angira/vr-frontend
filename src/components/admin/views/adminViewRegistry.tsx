"use client";

import type { ComponentType } from "react";
import type { AdminModuleKey } from "@/components/admin/commonTable/adminModuleTable.config";
import { CmsPageView } from "@/components/admin/cms-pages/CmsPageView";
import { ProductView } from "@/components/admin/products/ProductView";

export type AdminViewProps = {
  module: AdminModuleKey;
  recordId: string;
};

const adminViewRegistry: Partial<
  Record<AdminModuleKey, ComponentType<AdminViewProps>>
> = {
  "cms-pages": CmsPageView,
  products: ProductView,
};

export function getAdminViewComponent(module: string) {
  return adminViewRegistry[module as AdminModuleKey] ?? null;
}
