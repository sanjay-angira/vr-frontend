/** Relative paths — axios baseURL already includes `/backend/api`. */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "auth/login",
    SEND_OTP: "auth/send-otp",
    VERIFY_OTP: "auth/verify-otp",
    RESET_PASSWORD: "auth/reset-password",
    CHANGE_PASSWORD: "auth/change-password",
    REFRESH_TOKEN: "user/refresh-token",
    CHECK_EMAIL_EXISTS: (email: string) => `auth/checkEmailExists/${email}`,
    GET_USER: (id: number | string) => `auth/${id}`,
  },

  USERS: {
    LIST: "users",
    CREATE: "users",
    PERMISSIONS_TEMPLATE: "users/template/permissions",
    DELETE_REQUESTS: "users/delete-requests",
    DETAILS: (id: number | string) => `users/${id}`,
    UPDATE: (id: number | string) => `users/${id}`,
    DELETE: (id: number | string) => `users/${id}`,
    DEACTIVATE: (id: number | string) => `users/${id}/deactivate`,
  },

  ROLES: {
    LIST: "roles",
    CREATE: "roles",
    DETAILS: (id: number | string) => `roles/${id}`,
    UPDATE: (id: number | string) => `roles/${id}`,
    DELETE: (id: number | string) => `roles/${id}`,
  },

  MODULES: {
    LIST: "modules",
    CREATE: "modules",
    DETAILS: (id: number | string) => `modules/${id}`,
    UPDATE: (id: number | string) => `modules/${id}`,
    DELETE: (id: number | string) => `modules/${id}`,
    UPDATE_CATEGORY_NAME: "modules/update-modules-category-name",
    UPDATE_CATEGORY_ORDER: "modules/update-modules-category-order",
    UPDATE_ORDER: "modules/update-modules-order",
    DELETE_CATEGORY: "modules/delete-modules-category",
    UPDATE_CATEGORY: (moduleId: number | string) =>
      `modules/${moduleId}/updateCategory`,
  },

  PRODUCTS: {
    LIST: "products",
    CREATE: "products",
    DETAILS: (id: number | string) => `products/${id}`,
    UPDATE: (id: number | string) => `products/${id}`,
    DELETE: (id: number | string) => `products/${id}`,
  },

  CATEGORIES: {
    LIST: "categories",
    CREATE: "categories",
    DETAILS: (id: number | string) => `categories/${id}`,
    UPDATE: (id: number | string) => `categories/${id}`,
    DELETE: (id: number | string) => `categories/${id}`,
    NEXT_LEVEL: (parentId: number | string) => `categories/next/${parentId}`,
  },

  BRANDS: {
    LIST: "brands",
    CREATE: "brands",
    DETAILS: (id: number | string) => `brands/${id}`,
    UPDATE: (id: number | string) => `brands/${id}`,
    DELETE: (id: number | string) => `brands/${id}`,
  },

  ATTRIBUTES: {
    LIST: "attributes",
    CREATE: "attributes",
    DETAILS: (id: number | string) => `attributes/${id}`,
    UPDATE: (id: number | string) => `attributes/${id}`,
    DELETE: (id: number | string) => `attributes/${id}`,
  },

  PRODUCT_TAGS: {
    LIST: "product-tags",
    CREATE: "product-tags",
    DETAILS: (id: number | string) => `product-tags/${id}`,
    UPDATE: (id: number | string) => `product-tags/${id}`,
    DELETE: (id: number | string) => `product-tags/${id}`,
  },

  OFFERS: {
    LIST: "offers",
    CREATE: "offers",
    DETAILS: (id: number | string) => `offers/${id}`,
    UPDATE: (id: number | string) => `offers/${id}`,
    DELETE: (id: number | string) => `offers/${id}`,
  },

  COUPONS: {
    LIST: "coupons",
    CREATE: "coupons",
    DETAILS: (id: number | string) => `coupons/${id}`,
    BY_CODE: (code: string) => `coupons/code/${code}`,
    UPDATE: (id: number | string) => `coupons/${id}`,
    DELETE: (id: number | string) => `coupons/${id}`,
  },

  REVIEWS: {
    LIST: "reviews",
    CREATE: "reviews",
    DETAILS: (id: number | string) => `reviews/${id}`,
    UPDATE: (id: number | string) => `reviews/${id}`,
    DELETE: (id: number | string) => `reviews/${id}`,
    BY_PRODUCT: (productId: number | string) => `reviews/product/${productId}`,
    BY_USER: (userId: number | string) => `reviews/user/${userId}`,
    PRODUCT_AVERAGE: (productId: number | string) =>
      `reviews/product/${productId}/average`,
  },

  FAQS: {
    LIST: "faqs",
    CREATE: "faqs",
    DETAILS: (id: number | string) => `faqs/${id}`,
    UPDATE: (id: number | string) => `faqs/${id}`,
    DELETE: (id: number | string) => `faqs/${id}`,
    BY_PRODUCT: (productId: number | string) => `faqs/product/${productId}`,
  },

  BLOGS: {
    LIST: "blogs",
    CREATE: "blogs",
    DETAILS: (id: number | string) => `blogs/${id}`,
    UPDATE: (id: number | string) => `blogs/${id}`,
    DELETE: (id: number | string) => `blogs/${id}`,
  },

  BLOG_CATEGORIES: {
    LIST: "blog-categories",
    CREATE: "blog-categories",
    DETAILS: (id: number | string) => `blog-categories/${id}`,
    UPDATE: (id: number | string) => `blog-categories/${id}`,
    DELETE: (id: number | string) => `blog-categories/${id}`,
  },

  BLOG_TAGS: {
    LIST: "blog-tags",
    CREATE: "blog-tags",
    DETAILS: (id: number | string) => `blog-tags/${id}`,
    UPDATE: (id: number | string) => `blog-tags/${id}`,
    DELETE: (id: number | string) => `blog-tags/${id}`,
  },

  BANNERS: {
    LIST: "banners",
    CREATE: "banners",
    DETAILS: (id: number | string) => `banners/${id}`,
    UPDATE: (id: number | string) => `banners/${id}`,
    DELETE: (id: number | string) => `banners/${id}`,
  },

  CMS_SECTIONS: {
    LIST: "cms-sections",
    CREATE: "cms-sections",
    REORDER: "cms-sections/reorder",
    DETAILS: (id: number | string) => `cms-sections/${id}`,
    UPDATE: (id: number | string) => `cms-sections/${id}`,
    DELETE: (id: number | string) => `cms-sections/${id}`,
  },

  CMS_PAGES: {
    LIST: "cms-pages",
    CREATE: "cms-pages",
    DETAILS: (id: number | string) => `cms-pages/${id}`,
    UPDATE: (id: number | string) => `cms-pages/${id}`,
    DELETE: (id: number | string) => `cms-pages/${id}`,
    BY_SLUG: (slug: string) => `cms-pages/slug/${slug}`,
  },

  FOOTER: {
    PUBLIC: "footer/public",
    SECTIONS: "admin/footer-sections",
    SECTION_BY_ID: (id: number | string) => `admin/footer-sections/${id}`,
    ITEMS: "footer-items",
    ITEM_BY_ID: (id: number | string) => `footer-items/${id}`,
    ITEMS_BY_SECTION: (sectionId: number | string) =>
      `footer-items/section/${sectionId}`,
  },

  CONTACT_LEADS: {
    LIST: "contact-us-leads",
    DETAILS: (id: number | string) => `contact-us-leads/${id}`,
    STATUS: (id: number | string) => `contact-us-leads/${id}/status`,
    SEND_OTP: "customer/contact-us/send-otp",
    VERIFY_OTP: "customer/contact-us/verify-otp",
  },

  CUSTOMER_AUTH: {
    SEND_WHATSAPP_OTP: "customer/auth/send-whatsapp-otp",
    VERIFY_WHATSAPP_OTP: "customer/auth/verify-whatsapp-otp",
    COMPLETE_PROFILE: "customer/auth/complete-profile",
    VERIFY_EMAIL_OTP: "customer/auth/verify-email-otp",
    RESEND_EMAIL_OTP: "customer/auth/resend-email-otp",
  },

  CUSTOMER: {
    HOMEPAGE: "customer/homepage",
    SITEMAP: "customer/sitemap",
    STORE_PRODUCTS: "customer/all-products",
    PRODUCT_DETAILS: (slug: string) => `customer/product/${slug}`,
    STORE_FILTERS: "customer/store-filters",
    SEARCH: "customer/search",
    CATEGORIES: "customer/categories",
    BLOGS: "customer/blogs",
    BLOG_FILTERS: "customer/blog-filters",
    BLOG_DETAILS: (slug: string) => `customer/blog/${slug}`,
    ADD_CART: "customer/add-cart-item",
    GET_CART: "customer/get-cart-items",
    UPDATE_CART: "customer/update-cart-item",
    CLEAR_CART: "customer/clear-cart",
    CART_COUNT: "customer/cart-count",
    REMOVE_CART: (id: number | string) => `customer/remove-cart-item/${id}`,
    CHECKOUT: "customer/checkout",
    APPLY_COUPON: "customer/apply-coupon",
    RAZORPAY_VERIFY: "customer/payments/razorpay/verify",
    ORDER_DETAILS: (orderNumber: string) => `customer/order/${orderNumber}`,
    ORDERS: "customer/orders",
    ADDRESSES: "customer/addresses",
    ADDRESS_BY_ID: (id: number | string) => `customer/addresses/${id}`,
    ADDRESS_DEFAULT: (id: number | string) => `customer/addresses/${id}/default`,
    WISHLIST: "customer/wishlist",
    WISHLIST_IDS: "customer/wishlist/ids",
    WISHLIST_COUNT: "customer/wishlist/count",
    WISHLIST_TOGGLE: "customer/wishlist/toggle",
    WISHLIST_BY_ID: (id: number | string) => `customer/wishlist/${id}`,
    WISHLIST_BY_VARIATION: (variationId: number | string) =>
      `customer/wishlist/by-variation/${variationId}`,
    RECENTLY_VIEWED: "customer/recently-viewed",
    REVIEWS: "customer/reviews",
  },

  ORDERS: {
    LIST: "orders",
    DETAILS: (id: number | string) => `orders/${id}`,
  },

  DASHBOARD: {
    SUMMARY: "dashboard",
  },

  PAYMENTS: {
    LIST: "payments",
  },

  SETTINGS: {
    LIST: "settings",
  },
} as const;

export default API_ENDPOINTS;


