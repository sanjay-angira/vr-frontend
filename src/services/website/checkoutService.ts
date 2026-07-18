import { getData, postData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import {
  appendCartIdentity,
  getCartIdentity,
} from "@/utils/cartIdentity";

export type CheckoutPayload = {
  customerName: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
  paymentMethod: "cod" | "online";
};

export type PlacedOrder = {
  id: number;
  orderNumber: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  customerName: string;
  phone: string;
  email?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  notes?: string | null;
  items: Array<{
    id: number;
    productName: string;
    variantName?: string | null;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    image?: string | null;
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
