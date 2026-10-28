/** Relative paths — axios baseURL already includes `/backend/api`. */

export const API_ENDPOINTS = {
  COUPONS: {
    PUBLIC_LIST: "coupons/public",
  },

  CMS_PAGES: {
    PUBLIC_LIST: "cms-pages/public",
    BY_SLUG: (slug: string) => `cms-pages/slug/${slug}`,
  },

  CONTACT_LEADS: {
    SEND_OTP: "customer/contact-us/send-otp",
    VERIFY_OTP: "customer/contact-us/verify-otp",
  },

  CUSTOMER_AUTH: {
    SEND_WHATSAPP_OTP: "customer/auth/send-whatsapp-otp",
    VERIFY_WHATSAPP_OTP: "customer/auth/verify-whatsapp-otp",
    COMPLETE_PROFILE: "customer/auth/complete-profile",
    VERIFY_EMAIL_OTP: "customer/auth/verify-email-otp",
    RESEND_EMAIL_OTP: "customer/auth/resend-email-otp",
    REFRESH_TOKEN: "customer/auth/refresh-token",
  },

  SHIPPING: {
    CHECK_PIN: "shipping/serviceability",
    REVERSE_GEOCODE: "shipping/location",
    ESTIMATE: "shipping/estimate",
  },

  CUSTOMER: {
    HOMEPAGE: "customer/homepage",
    HOMEPAGE_BANNERS: "customer/banners",
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
    SHIPPING_ESTIMATE: "customer/shipping-estimate",
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
    WISHLIST_BY_VARIATION: (variationId: number | string) => `customer/wishlist/by-variation/${variationId}`,
    RECENTLY_VIEWED: "customer/recently-viewed",
    REVIEWS: "customer/reviews",
  },
} as const;

export default API_ENDPOINTS;
