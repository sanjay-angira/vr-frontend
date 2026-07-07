"use client";

import type { ComponentType } from "react";
import type { AdminModuleKey } from "@/components/admin/commonTable/adminModuleTable.config";
import type { AdminFormProps } from "./types";
import { AttributeForm } from "./AttributeForm";
import { BannerForm } from "./BannerForm";
import { BlogCategoryForm } from "./BlogCategoryForm";
import { BlogForm } from "./BlogForm";
import { BlogTagForm } from "./BlogTagForm";
import { BrandForm } from "./BrandForm";
import { CategoryForm } from "./CategoryForm";
import { CmsPageForm } from "./CmsPageForm";
import { CouponForm } from "./CouponForm";
import { OfferForm } from "./OfferForm";
import { ProductFaqForm } from "./ProductFaqForm";
import { ProductForm } from "./ProductForm";
import { ReviewForm } from "./ReviewForm";
import { UserForm } from "./UserForm";

const adminFormRegistry: Partial<
  Record<AdminModuleKey, ComponentType<AdminFormProps>>
> = {
  products: ProductForm,
  categories: CategoryForm,
  brands: BrandForm,
  attributes: AttributeForm,
  offers: OfferForm,
  coupons: CouponForm,
  banners: BannerForm,
  "cms-pages": CmsPageForm,
  blogs: BlogForm,
  "blog-categories": BlogCategoryForm,
  "blog-tags": BlogTagForm,
  reviews: ReviewForm,
  "product-reviews": ReviewForm,
  "product-faq": ProductFaqForm,
  users: UserForm,
  customers: UserForm,
};

export function getAdminFormComponent(module: string) {
  return adminFormRegistry[module as AdminModuleKey] ?? null;
}
