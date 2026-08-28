
export type AdminMenuItem = {
  label: string;
  href: string;
  icon: string;
};

export type AdminMenuSection = {
  title: string;
  items: AdminMenuItem[];
};


export const adminMenuSections: AdminMenuSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: "layout-dashboard",
      },
    ],
  },
  {
    title: "Catalog",
    items: [
      {
        label: "Products",
        href: "/admin/products",
        icon: "package",
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: "layout-grid",
      },
      {
        label: "Brands",
        href: "/admin/brands",
        icon: "award",
      },
      {
        label: "Attributes",
        href: "/admin/attributes",
        icon: "sliders-horizontal",
      },
    ],
  },
  {
    title: "Marketing",
    items: [
      {
        label: "Offers & Deals",
        href: "/admin/offers",
        icon: "percent",
      },
      {
        label: "Coupons",
        href: "/admin/coupons",
        icon: "ticket",
      },
      {
        label: "Banners",
        href: "/admin/banners",
        icon: "image",
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        label: "CMS Pages",
        href: "/admin/cms-pages",
        icon: "file-text",
      },
      {
        label: "Blog Posts",
        href: "/admin/blogs",
        icon: "newspaper",
      },
      {
        label: "Blog Categories",
        href: "/admin/blog-categories",
        icon: "folder-tree",
      },
      {
        label: "Blog Tags",
        href: "/admin/blog-tags",
        icon: "hash",
      },
      {
        label: "Reviews",
        href: "/admin/reviews",
        icon: "star",
      },
      {
        label: "Footer Settings",
        href: "/admin/footer-settings",
        icon: "panel-bottom",
      },
      {
        label: "Website layout",
        href: "/admin/website-layout",
        icon: "layout-template",
      },
    ],
  },
  {
    title: "Customers",
    items: [
      {
        label: "Orders",
        href: "/admin/orders",
        icon: "clipboard-list",
      },
      {
        label: "User",
        href: "/admin/customers",
        icon: "users",
      },
      {
        label: "Delete Requests",
        href: "/admin/delete-requests",
        icon: "user-x",
      },
      {
        label: "Product Reviews",
        href: "/admin/product-reviews",
        icon: "message-square-text",
      },
      {
        label: "Product FAQ",
        href: "/admin/product-faq",
        icon: "message-circle-question",
      },
      {
        label: "Contact Us Leads",
        href: "/admin/contact-us-leads",
        icon: "mail",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        href: "/admin/settings",
        label: "Settings",
        icon: "settings",
      },
    ],
  },
];
