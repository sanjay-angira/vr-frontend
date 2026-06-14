// src/services/api/API_ENDPOINT.ts

'use client'
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `user/login`,
  SEND_WHATSAPP_OTP: `customer/auth/send-whatsapp-otp`,
  VERIFY_WHATSAPP_OTP: `customer/auth/verify-whatsapp-otp`,
  SIGN_UP: `user/sign-up`,
  USER_PROFILE: `user/profile`,

  // Cart endpoints
  ADD_CART_ITEM: `customer/add-cart-item`,
  UPDATE_CART_ITEM: `customer/update-cart-item`,
  REMOVE_CART_ITEM: `customer/remove-cart-item/:id`,
  CLEAR_CART: `customer/clear-cart`,
  CART_COUNT: `customer/cart-count`,
  GET_CART_ITEMS: `customer/get-cart-items`,
  STORE_PRODUCTS: `customer/store-products`,

  // Footer
  FOOTER_PUBLIC: `footer/public`,

  // Add more endpoints as needed
};
