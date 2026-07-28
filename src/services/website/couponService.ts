import { getData, postData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";
import { getCartIdentity } from "@/utils/cartIdentity";

export type WebsiteCoupon = {
  id: number;
  couponCode: string;
  image: string | null;
  discountType: string;
  discountValue: number;
  startDate?: string;
  endDate?: string;
};

export type AppliedCoupon = {
  id: number;
  couponCode: string;
  discountType: string;
  discountValue: number;
};

function toDateKey(value: string | Date | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    return match?.[1] ?? null;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return null;
}

function isPublicCouponActive(row: Record<string, unknown>): boolean {
  if (row.isUserSpecific === true) return false;
  if (row.isActive === false) return false;

  const today = new Date().toISOString().slice(0, 10);
  const start = toDateKey(row.startDate as string | Date | undefined);
  const end = toDateKey(row.endDate as string | Date | undefined);

  if (start && start > today) return false;
  if (end && end < today) return false;

  return true;
}

export function computeCouponDiscountAmount(
  discountType: string,
  discountValue: number,
  payableSubtotal: number
): number {
  const subtotal = Math.max(0, Number(payableSubtotal) || 0);
  const value = Number(discountValue) || 0;
  const type = String(discountType || "").toLowerCase();

  if (subtotal <= 0 || value <= 0) return 0;

  if (type === "percentage" || type === "percent") {
    return Math.min(subtotal, Math.round((subtotal * value) / 100));
  }

  return Math.min(subtotal, value);
}

/**
 * Loads coupons from GET /coupons and keeps only active,
 * non-user-specific codes for the storefront.
 */
export async function fetchWebsiteCoupons(): Promise<WebsiteCoupon[]> {
  try {
    const response = await getData(
      API_ENDPOINTS.COUPONS.LIST,
      {
        pageNumber: 1,
        pageSize: 50,
        column: "discountValue",
        order: "DESC",
      },
      { auth: false }
    );

    if (!response?.success) {
      return [];
    }

    const rows: Array<Record<string, unknown>> = Array.isArray(response?.data?.rows)
      ? response.data.rows
      : Array.isArray(response?.data)
        ? response.data
        : [];

    return rows
      .filter(isPublicCouponActive)
      .map((row) => {
        const rawImage =
          typeof row.image === "string" && row.image.trim().length > 0
            ? row.image.trim()
            : null;

        return {
          id: Number(row.id),
          couponCode: String(row.couponCode ?? "").trim(),
          image: rawImage ? resolveImageUrl(rawImage) || null : null,
          discountType: String(row.discountType ?? "percentage"),
          discountValue: Number(row.discountValue ?? 0),
          startDate: row.startDate ? String(row.startDate) : undefined,
          endDate: row.endDate ? String(row.endDate) : undefined,
        };
      })
      .filter((coupon) => coupon.id > 0 && coupon.couponCode.length > 0);
  } catch {
    return [];
  }
}

/** Storefront apply: POST /customer/apply-coupon → { id, couponCode, discountType, discountValue } */
export async function applyCouponCode(code: string): Promise<AppliedCoupon> {
  const trimmed = code.trim();
  if (!trimmed) {
    throw new Error("Enter a coupon code");
  }

  const identity = getCartIdentity();
  const response = await postData(
    API_ENDPOINTS.CUSTOMER.APPLY_COUPON,
    {
      code: trimmed,
      ...(identity.userId ? { userId: identity.userId } : {}),
    },
    { auth: false }
  );

  if (!response?.success || !response?.data?.id) {
    throw new Error(response?.message || "Invalid Coupon Code");
  }

  return {
    id: Number(response.data.id),
    couponCode: String(response.data.couponCode ?? trimmed).trim(),
    discountType: String(response.data.discountType ?? "percentage"),
    discountValue: Number(response.data.discountValue ?? 0),
  };
}
