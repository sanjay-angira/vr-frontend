/** S3 folder paths — aligned with vr-admin upload paths. */
export const UPLOAD_PATHS = {
  products: "/products/images",
  variantImages: "/products/variant-images",
  categories: {
    image: "/product-category/images",
    video: "/product-category/videos",
    icon: "/product-category/icons",
  },
  offers: "/offers/images",
  coupons: "/coupons/images",
  banners: "/banners/images",
  blogs: "/blog/images",
  users: "/user/images",
  attributeColors: "/products/attribute-colors",
  footer: {
    icons: "/footer/icons",
  },
  
} as const;
