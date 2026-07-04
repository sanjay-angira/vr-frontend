/** S3 folder paths — aligned with vr-admin upload paths. */
export const UPLOAD_PATHS = {
  products: "/products/images",
  variantImages: "/products/variant-images",
  categories: {
    image: "/product-category/images",
    image3d: "/product-category/3d-assets",
    video: "/product-category/videos",
    icon: "/product-category/icons",
  },
  offers: "/offers/images",
  coupons: "/coupons/images",
  banners: "/banners/images",
  blogs: "/blog/images",
  users: "/user/images",
  footer: {
    icons: "/footer/icons",
  },
  
} as const;
