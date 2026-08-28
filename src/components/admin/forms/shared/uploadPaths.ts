/** S3 folder paths — aligned with vr-admin upload paths. */
export const UPLOAD_PATHS = {
  products: "/products/images",
  variantImages: "/products/variant-images",
  categories: {
    image: "/product-category/images",
    mobile: "/product-category/mobile",
  },
  offers: "/offers/images",
  coupons: "/coupons/images",
  banners: "/banners/images",
  blogs: "/blog/images",
  users: "/user/images",
  attributeColors: "/products/attribute-colors",
} as const;
