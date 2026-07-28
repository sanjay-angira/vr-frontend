"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CartItemData } from "@/services/website/cartService";
import { useCart } from "@/components/website/hooks/useCart";
import { OrderSummary } from "@/components/website/cart/OrderSummary";
import {
  placeOrder,
  verifyRazorpayPayment,
  type CheckoutPayload,
} from "@/services/website/checkoutService";
import { openRazorpayCheckout } from "@/utils/razorpayCheckout";
import {
  applyCouponCode,
  computeCouponDiscountAmount,
  type AppliedCoupon,
} from "@/services/website/couponService";
import { getOrderSummaryTotals } from "@/components/website/cart/commerceUtils";

export type OrderSummaryShippingMode = "threshold" | "free";

export type OrderSummaryConfig = {
  shippingMode: OrderSummaryShippingMode;
  secureNote: boolean;
};

/** @deprecated Use OrderSummaryConfig */
export type PaymentSummaryShippingMode = OrderSummaryShippingMode;
/** @deprecated Use OrderSummaryConfig */
export type PaymentSummaryConfig = OrderSummaryConfig & { showItems?: boolean };

export type DeliveryAddress = Omit<CheckoutPayload, "paymentMethod" | "notes"> & {
  customerName: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
  addressId?: number;
};

type PlaceOrderContextType = {
  items: CartItemData[];
  total: number;
  loading: boolean;
  error: string | null;

  config: OrderSummaryConfig;
  isCheckout: boolean;

  fetchCart: () => void;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<unknown>;
  removeItem: (cartItemId: number) => Promise<unknown>;
  clearCart: () => Promise<unknown>;
  setItems: (items: CartItemData[]) => void;

  confirmDeliveryAddress: DeliveryAddress | null;
  setConfirmDeliveryAddress: (address: DeliveryAddress | null) => void;

  paymentMethod: "cod" | "online";
  setPaymentMethod: (method: "cod" | "online") => void;

  appliedCoupon: AppliedCoupon | null;
  couponDiscount: number;
  couponInput: string;
  setCouponInput: (value: string) => void;
  couponApplying: boolean;
  couponError: string | null;
  applyCoupon: (code?: string) => Promise<void>;
  removeCoupon: () => void;

  checkoutLoading: boolean;
  checkoutError: string | null;
  handlePlaceOrder: () => void;
  submitCheckout: () => Promise<void>;
};

const PlaceOrderContext = createContext<PlaceOrderContextType | undefined>(
  undefined,
);

export function usePlaceOrderContext() {
  const context = useContext(PlaceOrderContext);
  if (!context) {
    throw new Error(
      "usePlaceOrderContext must be used within a PlaceOrderFlowWrapper",
    );
  }
  return context;
}

function configForPath(pathname: string | null): OrderSummaryConfig {
  if (pathname?.startsWith("/checkout")) {
    return { shippingMode: "free", secureNote: true };
  }
  return { shippingMode: "threshold", secureNote: false };
}

function PlaceOrderFlowWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cart = useCart();

  const [config, setConfig] = useState<OrderSummaryConfig>(() =>
    configForPath(pathname),
  );
  const [confirmDeliveryAddress, setConfirmDeliveryAddress] =
    useState<DeliveryAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [pendingDeepLinkCoupon, setPendingDeepLinkCoupon] = useState<string | null>(
    null,
  );
  /** False until first client fetch finishes — keeps SSR + hydrate on loading UI. */
  const [cartReady, setCartReady] = useState(false);

  const isCheckout = Boolean(pathname?.startsWith("/checkout"));
  const cartLoading = !cartReady || cart.loading;

  const merchandiseTotal = useMemo(
    () => getOrderSummaryTotals(cart.items).merchandiseTotal,
    [cart.items],
  );

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return computeCouponDiscountAmount(
      appliedCoupon.discountType,
      appliedCoupon.discountValue,
      merchandiseTotal,
    );
  }, [appliedCoupon, merchandiseTotal]);

  useEffect(() => {
    setConfig(configForPath(pathname));
    if (!pathname?.startsWith("/checkout")) {
      setConfirmDeliveryAddress(null);
      setCheckoutError(null);
    }
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    void cart.fetchCart().finally(() => {
      if (!cancelled) setCartReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [cart.fetchCart]);

  useEffect(() => {
    const code = searchParams?.get("coupon")?.trim();
    if (!code) return;
    setCouponInput(code);
    setPendingDeepLinkCoupon(code);
  }, [searchParams]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponInput("");
  }, []);

  const applyCoupon = useCallback(
    async (code?: string) => {
      const nextCode = (code ?? couponInput).trim();
      if (!nextCode) {
        setCouponError("Enter a coupon code");
        return;
      }

      setCouponApplying(true);
      setCouponError(null);

      try {
        const applied = await applyCouponCode(nextCode);
        const amount = computeCouponDiscountAmount(
          applied.discountType,
          applied.discountValue,
          merchandiseTotal,
        );

        if (
          applied.discountType.toLowerCase() === "fixed" &&
          applied.discountValue > merchandiseTotal
        ) {
          throw new Error(
            "Cart total is too low for this coupon. Add more items to use it.",
          );
        }

        if (amount <= 0) {
          throw new Error("Coupon discount is not applicable on this cart");
        }

        setAppliedCoupon(applied);
        setCouponInput(applied.couponCode);
      } catch (error) {
        setAppliedCoupon(null);
        const message =
          error instanceof Error ? error.message : "Invalid Coupon Code";
        setCouponError(message);
        throw error;
      } finally {
        setCouponApplying(false);
      }
    },
    [couponInput, merchandiseTotal],
  );

  useEffect(() => {
    if (!pendingDeepLinkCoupon) return;
    if (cartLoading) return;
    if (cart.items.length === 0) return;

    const code = pendingDeepLinkCoupon;
    setPendingDeepLinkCoupon(null);

    void applyCoupon(code).finally(() => {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (url.searchParams.has("coupon")) {
          url.searchParams.delete("coupon");
          window.history.replaceState({}, "", url.pathname + url.search);
        }
      }
    });
  }, [
    pendingDeepLinkCoupon,
    cartLoading,
    cart.items.length,
    applyCoupon,
  ]);

  useEffect(() => {
    if (!appliedCoupon) return;
    if (
      appliedCoupon.discountType.toLowerCase() === "fixed" &&
      appliedCoupon.discountValue > merchandiseTotal
    ) {
      setAppliedCoupon(null);
      setCouponError(
        "Coupon removed because cart total is below the fixed discount.",
      );
    }
  }, [appliedCoupon, merchandiseTotal]);

  const handlePlaceOrder = useCallback(() => {
    if (cart.items.length === 0) return;
    setCheckoutLoading(true);
    router.push("/checkout");
    setCheckoutLoading(false);
  }, [cart.items.length, router]);

  const submitCheckout = useCallback(async () => {
    if (!confirmDeliveryAddress || cart.items.length === 0) return;

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const order = await placeOrder({
        addressId: confirmDeliveryAddress.addressId,
        customerName: confirmDeliveryAddress.customerName.trim(),
        phone: confirmDeliveryAddress.phone.trim(),
        email: confirmDeliveryAddress.email?.trim() || undefined,
        addressLine1: confirmDeliveryAddress.addressLine1.trim(),
        addressLine2: confirmDeliveryAddress.addressLine2?.trim() || undefined,
        city: confirmDeliveryAddress.city.trim(),
        state: confirmDeliveryAddress.state.trim(),
        pincode: confirmDeliveryAddress.pincode.trim(),
        notes: confirmDeliveryAddress.notes?.trim() || undefined,
        paymentMethod,
        ...(appliedCoupon?.id ? { couponId: appliedCoupon.id } : {}),
      });

      if (paymentMethod === "online") {
        if (!order.razorpay?.orderId || !order.razorpay.keyId) {
          throw new Error("Razorpay checkout details missing from server");
        }

        const payment = await openRazorpayCheckout(order.razorpay);

        try {
          await verifyRazorpayPayment({
            orderNumber: order.orderNumber,
            razorpay_order_id: payment.razorpay_order_id,
            razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_signature: payment.razorpay_signature,
          });
        } catch (verifyErr) {
          console.error("Razorpay verify failed after payment:", verifyErr);
        }
      }

      try {
        await cart.clearCart();
      } catch {
        cart.setItems([]);
      }

      setConfirmDeliveryAddress(null);
      setAppliedCoupon(null);
      setCouponInput("");
      router.replace(
        `/thank-you?order=${encodeURIComponent(order.orderNumber)}`,
      );
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message)
          : "Unable to place order";
      setCheckoutError(message);
      void cart.fetchCart();
    } finally {
      setCheckoutLoading(false);
    }
  }, [confirmDeliveryAddress, cart, paymentMethod, router, appliedCoupon]);

  const value = useMemo<PlaceOrderContextType>(
    () => ({
      items: cart.items,
      total: cart.total,
      loading: cartLoading,
      error: cart.error,
      config,
      isCheckout,
      fetchCart: () => {
        void cart.fetchCart();
      },
      updateQuantity: async (cartItemId, quantity) => {
        await cart.updateQuantity(cartItemId, quantity);
      },
      removeItem: async (cartItemId) => {
        await cart.removeItem(cartItemId);
      },
      clearCart: async () => {
        await cart.clearCart();
      },
      setItems: (nextItems) => {
        cart.setItems(nextItems);
      },
      confirmDeliveryAddress,
      setConfirmDeliveryAddress,
      paymentMethod,
      setPaymentMethod,
      appliedCoupon,
      couponDiscount,
      couponInput,
      setCouponInput,
      couponApplying,
      couponError,
      applyCoupon,
      removeCoupon,
      checkoutLoading,
      checkoutError,
      handlePlaceOrder,
      submitCheckout,
    }),
    [
      cart.items,
      cart.total,
      cartLoading,
      cart.error,
      cart.fetchCart,
      cart.updateQuantity,
      cart.removeItem,
      cart.clearCart,
      cart.setItems,
      config,
      isCheckout,
      confirmDeliveryAddress,
      paymentMethod,
      appliedCoupon,
      couponDiscount,
      couponInput,
      couponApplying,
      couponError,
      applyCoupon,
      removeCoupon,
      checkoutLoading,
      checkoutError,
      handlePlaceOrder,
      submitCheckout,
    ],
  );

  return (
    <PlaceOrderContext.Provider value={value}>
      <div className="commerce-page commerce-surface place-order-flow chec-out-page">
        <div className="commerce-container checkout-inner-content">
          <div className="add-cart-sec place-order-grid">
            <div className="productcards place-order-main cart-main">
              {children}
            </div>
            <aside className="price-details cart-detail sticky-summary place-order-summary">
              <OrderSummary />
            </aside>
          </div>
        </div>
      </div>
    </PlaceOrderContext.Provider>
  );
}

export default PlaceOrderFlowWrapper;
