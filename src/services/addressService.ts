import { deleteData, getData, postData, putData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { getCartIdentity } from "@/utils/cartIdentity";

export type UserAddress = {
  id: number;
  userId: number;
  label?: string | null;
  fullName: string;
  phone: string;
  email?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type UserAddressPayload = {
  label?: string;
  fullName: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

function requireUserId() {
  const userId = getCartIdentity().userId;
  if (!userId) {
    throw new Error("Please log in to manage addresses");
  }
  return userId;
}

export async function listUserAddresses(): Promise<UserAddress[]> {
  const userId = requireUserId();
  const response = (await getData(API_ENDPOINTS.CUSTOMER.ADDRESSES, {
    userId,
  })) as ApiEnvelope<UserAddress[]>;

  if (response?.success === false) {
    throw new Error(response.message || "Failed to load addresses");
  }

  return Array.isArray(response?.data) ? response.data : [];
}

export async function createUserAddress(
  payload: UserAddressPayload,
): Promise<UserAddress> {
  const userId = requireUserId();
  const response = (await postData(API_ENDPOINTS.CUSTOMER.ADDRESSES, {
    ...payload,
    userId,
  })) as ApiEnvelope<UserAddress>;

  if (response?.success === false || !response?.data) {
    throw new Error(response?.message || "Failed to save address");
  }

  return response.data;
}

export async function updateUserAddress(
  id: number,
  payload: Partial<UserAddressPayload>,
): Promise<UserAddress> {
  const userId = requireUserId();
  const response = (await putData(API_ENDPOINTS.CUSTOMER.ADDRESS_BY_ID(id), {
    ...payload,
    userId,
  })) as ApiEnvelope<UserAddress>;

  if (response?.success === false || !response?.data) {
    throw new Error(response?.message || "Failed to update address");
  }

  return response.data;
}

export async function deleteUserAddress(id: number): Promise<void> {
  const userId = requireUserId();
  const response = (await deleteData(
    `${API_ENDPOINTS.CUSTOMER.ADDRESS_BY_ID(id)}?userId=${userId}`,
  )) as ApiEnvelope<null>;

  if (response?.success === false) {
    throw new Error(response.message || "Failed to delete address");
  }
}

export async function setDefaultUserAddress(id: number): Promise<UserAddress> {
  const userId = requireUserId();
  const response = (await putData(
    `${API_ENDPOINTS.CUSTOMER.ADDRESS_DEFAULT(id)}?userId=${userId}`,
    {},
  )) as ApiEnvelope<UserAddress>;

  if (response?.success === false || !response?.data) {
    throw new Error(response?.message || "Failed to set default address");
  }

  return response.data;
}

export function addressToDeliveryFields(address: UserAddress) {
  return {
    addressId: address.id,
    customerName: address.fullName,
    phone: address.phone,
    email: address.email || "",
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 || "",
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    notes: "",
  };
}
