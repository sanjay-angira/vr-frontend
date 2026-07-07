import type { DataTableAction } from "@/components/common/DataTable";
import type { AdminTableColumnDefinition } from "@/components/admin/commonTable/staticAdminTableColumns";
import {
  AttributeComponentColumns,
  BannerComponentColumns,
  BlogCategoryComponentColumns,
  BlogComponentColumns,
  BlogTagComponentColumns,
  BrandComponentColumns,
  CategoryComponentColumns,
  ContactUsLeadsColumns,
  CouponComponentColumns,
  CmsPagesComponentColumns,
  OffersAndDealsColumns,
  ProductComponentColumns,
  ProductFaqComponentColumns,
  ReviewsComponentColumns,
  UserComponentColumns,
} from "@/components/admin/commonTable/staticAdminTableColumns";

export type AdminModuleKey =
  | "products"
  | "categories"
  | "brands"
  | "attributes"
  | "offers"
  | "coupons"
  | "banners"
  | "cms-pages"
  | "blogs"
  | "blog-categories"
  | "blog-tags"
  | "reviews"
  | "header-settings"
  | "footer-settings"
  | "website-layout"
  | "users"
  | "customers"
  | "delete-requests"
  | "product-reviews"
  | "product-faq"
  | "contact-us-leads";

export type AdminModuleTableConfig = {
  label: string;
  description?: string;
  /** Backend list endpoint — defaults to the route module slug */
  apiPath?: string;
  /** Default sort column (vr-admin uses `id`) */
  sortColumn?: string;
  columns: AdminTableColumnDefinition[];
  actions: DataTableAction[];
  addLabel?: string;
};

export const adminModuleTableConfig: Record<
  AdminModuleKey,
  AdminModuleTableConfig
> = {
  products: {
    label: "Products",
    description: "Manage your product catalog",
    columns: ProductComponentColumns,
    actions: ["add", "view", "edit", "delete"],
    addLabel: "Add product",
  },
  categories: {
    label: "Categories",
    description: "Manage product categories",
    columns: CategoryComponentColumns,
    actions: ["add", "view", "edit", "delete"],
    addLabel: "Add category",
  },
  brands: {
    label: "Brands",
    description: "Manage product brands",
    columns: BrandComponentColumns,
    actions: ["add", "view", "edit", "delete"],
    addLabel: "Add brand",
  },
  attributes: {
    label: "Attributes",
    description: "Manage product attributes",
    columns: AttributeComponentColumns,
    actions: ["add", "view", "edit", "delete"],
    addLabel: "Add attribute",
  },
  offers: {
    label: "Offers & Deals",
    description: "Manage promotional offers and deals",
    columns: OffersAndDealsColumns,
    actions: ["add", "view", "edit", "delete"],
    addLabel: "Add offer",
  },
  coupons: {
    label: "Coupons",
    description: "Manage discount coupons",
    columns: CouponComponentColumns,
    actions: ["add", "view", "edit", "delete"],
    addLabel: "Add coupon",
  },
  banners: {
    label: "Banners",
    description: "Manage homepage banners",
    columns: BannerComponentColumns,
    actions: ["add", "view", "edit", "delete"],
    addLabel: "Add banner",
  },
  blogs: {
    label: "Blog Posts",
    description: "Manage blog posts",
    columns: BlogComponentColumns,
    actions: ["add", "view", "edit", "delete"],
    addLabel: "Add post",
  },
  "blog-categories": {
    label: "Blog Categories",
    description: "Manage blog categories",
    columns: BlogCategoryComponentColumns,
    actions: ["add", "view", "edit", "delete"],
    addLabel: "Add category",
  },
  "blog-tags": {
    label: "Blog Tags",
    description: "Manage blog tags",
    columns: BlogTagComponentColumns,
    actions: ["add", "view", "edit", "delete"],
    addLabel: "Add tag",
  },
  reviews: {
    label: "Reviews",
    description: "Manage product reviews",
    apiPath: "reviews",
    columns: ReviewsComponentColumns,
    actions: ["add", "view", "edit", "delete"],
    addLabel: "Add review",
  },
  "product-reviews": {
    label: "Product Reviews",
    description: "Manage product reviews",
    apiPath: "reviews",
    columns: ReviewsComponentColumns,
    actions: ["add", "view", "edit", "delete"],
    addLabel: "Add review",
  },
  "product-faq": {
    label: "Product FAQs",
    description: "Manage product FAQs",
    apiPath: "faqs",
    columns: ProductFaqComponentColumns,
    actions: ["add", "view", "edit", "delete"],
    addLabel: "Add FAQ",
  },
  users: {
    label: "Users",
    description: "View admin user accounts",
    columns: UserComponentColumns,
    actions: ["add", "view", "edit", "delete"],
    addLabel: "Add user",
  },
  customers: {
    label: "Users",
    description: "View admin user accounts",
    apiPath: "users",
    columns: UserComponentColumns,
    actions: ["add", "view", "edit", "delete"],
    addLabel: "Add user",
  },
  "delete-requests": {
    label: "Delete Requests",
    description: "Manage account deletion requests",
    apiPath: "users/delete-requests",
    sortColumn: "updatedAt",
    columns: UserComponentColumns,
    actions: ["delete"],
  },
  "contact-us-leads": {
    label: "Contact Us Leads",
    description: "Manage contact form leads",
    columns: ContactUsLeadsColumns,
    actions: ["view", "edit", "delete"],
  },
  "cms-pages": {
    label: "CMS Pages",
    description: "Manage static content pages",
    apiPath: "cms-pages",
    columns: CmsPagesComponentColumns,
    actions: ["add", "view", "edit", "delete"],
    addLabel: "Add page",
  },
  "header-settings": {
    label: "Header Settings",
    description: "Manage header settings",
    columns: [],
    actions: ["add", "view", "edit", "delete"],
    addLabel: "Add setting",
  },
  "footer-settings": {
    label: "Footer Settings",
    description: "Manage footer settings",
    columns: [],
    actions: ["add", "view", "edit", "delete"],
    addLabel: "Add setting",
  },
  "website-layout": {
    label: "Website Layout",
    description: "Manage homepage sections",
    apiPath: "cms-sections",
    columns: [
      {
        label: "ID",
        property: "id",
        type: "text",
        datatype: "id",
        visible: true,
      },
      {
        label: "Title",
        property: "title",
        type: "text",
        datatype: "title",
        visible: true,
      },
      {
        label: "Type",
        property: "type",
        type: "text",
        datatype: "type",
        visible: true,
      },
      {
        label: "Status",
        property: "status",
        type: "text",
        datatype: "status",
        visible: true,
      },
      {
        label: "Position",
        property: "position",
        type: "text",
        datatype: "text",
        visible: true,
      },
      {
        label: "Actions",
        property: "actions",
        type: "button",
        datatype: "button",
        visible: true,
      },
    ],
    actions: ["add", "view", "edit", "delete"],
    addLabel: "Add section",
  },
};

export function getAdminModuleTableConfig(module: string) {
  if (!(module in adminModuleTableConfig)) {
    return null;
  }

  return adminModuleTableConfig[module as AdminModuleKey];
}

export function getAdminModuleApiPath(module: AdminModuleKey): string {
  const config = adminModuleTableConfig[module];
  return config.apiPath ?? module;
}

export function getAdminModuleEditPath(
  module: string,
  id: string | number
): string {
  return `/admin/${module}/edit/${id}`;
}

export function getAdminModuleViewPath(
  module: string,
  id: string | number
): string {
  return `/admin/${module}/view/${id}`;
}

export function getVisibleAdminColumns(
  columns: AdminTableColumnDefinition[]
): AdminTableColumnDefinition[] {
  return columns.filter(
    (column) => column.visible && column.datatype !== "button"
  );
}
