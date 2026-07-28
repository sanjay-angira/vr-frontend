import { getData, postData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import {
  appendCartIdentity,
  getCartIdentity,
} from "@/utils/cartIdentity";

export type CheckoutPayload = {
  addressId?: number;
  customerName?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  addressLabel?: string;
  notes?: string;
  paymentMethod: "cod" | "online";
  couponId?: number;
};

export type OrderShippingAddress = {
  addressId?: number | null;
  label?: string | null;
  fullName: string;
  phone: string;
  email?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
};

export type RazorpayCheckoutPayload = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
};

export type AppliedOrderOffer = {
  id?: number;
  offerName?: string | null;
  offerSlug?: string | null;
  discountType?: string | null;
  discountValue?: number | null;
  sources?: string[];
};

export type AppliedOrderCoupon = {
  id?: number | null;
  couponCode?: string | null;
  discountType?: string | null;
  discountValue?: number | null;
  couponDiscount?: number | null;
};

export type PlacedOrder = {
  id: number;
  orderNumber: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  listSubtotal?: number;
  discountTotal?: number;
  offerDiscountTotal?: number;
  couponDiscount?: number;
  couponId?: number | null;
  couponCode?: string | null;
  couponDiscountType?: string | null;
  couponDiscountValue?: number | null;
  coupon?: AppliedOrderCoupon | null;
  couponJson?: AppliedOrderCoupon | null;
  offers?: AppliedOrderOffer[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingAddress?: OrderShippingAddress | null;
  customerName: string;
  phone: string;
  email?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  notes?: string | null;
  razorpayOrderId?: string | null;
  razorpay?: RazorpayCheckoutPayload | null;
  items: Array<{
    id: number;
    productName: string;
    variantName?: string | null;
    quantity: number;
    listUnitPrice?: number;
    unitPrice: number;
    discountAmount?: number;
    subtotal: number;
    listSubtotal?: number;
    image?: string | null;
    offerJson?: AppliedOrderOffer | null;
    appliedOffer?: AppliedOrderOffer | null;
  }>;
  createdAt?: string;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export async function placeOrder(
  payload: CheckoutPayload
): Promise<PlacedOrder> {
  const identity = getCartIdentity();
  const response = (await postData(API_ENDPOINTS.CUSTOMER.CHECKOUT, {
    ...payload,
    ...identity,
  })) as ApiEnvelope<PlacedOrder>;

  if (response?.success === false) {
    throw new Error(response.message || "Failed to place order");
  }

  if (!response?.data?.orderNumber) {
    throw new Error(response?.message || "Invalid checkout response");
  }

  return response.data;
}

export async function verifyRazorpayPayment(payload: {
  orderNumber: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<PlacedOrder> {
  const identity = getCartIdentity();
  const response = (await postData(
    API_ENDPOINTS.CUSTOMER.RAZORPAY_VERIFY,
    {
      ...payload,
      ...identity,
    },
  )) as ApiEnvelope<PlacedOrder>;

  if (response?.success === false) {
    throw new Error(response.message || "Payment verification failed");
  }

  if (!response?.data?.orderNumber) {
    throw new Error(response?.message || "Invalid verification response");
  }

  return response.data;
}

export async function getOrderByNumber(
  orderNumber: string
): Promise<PlacedOrder> {
  const url = appendCartIdentity(
    API_ENDPOINTS.CUSTOMER.ORDER_DETAILS(orderNumber)
  );
  const response = (await getData(url)) as ApiEnvelope<PlacedOrder>;

  if (response?.success === false) {
    throw new Error(response.message || "Order not found");
  }

  if (!response?.data) {
    throw new Error("Order not found");
  }

  return response.data;
}

export async function getUserOrders(): Promise<PlacedOrder[]> {
  const identity = getCartIdentity();
  if (!identity.userId) {
    throw new Error("Please log in to view your orders");
  }

  const url = appendCartIdentity(API_ENDPOINTS.CUSTOMER.ORDERS, {
    userId: identity.userId,
  });
  const response = (await getData(url)) as ApiEnvelope<PlacedOrder[]>;

  if (response?.success === false) {
    throw new Error(response.message || "Failed to load orders");
  }

  return Array.isArray(response?.data) ? response.data : [];
}
