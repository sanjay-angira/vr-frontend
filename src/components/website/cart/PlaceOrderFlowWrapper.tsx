"use client";

/**
 * Place-order Context wrapper — mirrors tid-web `PlaceOrderFlowWrapper`.
 *
 * Stable shell (same on /cart and /checkout — no column reflow):
 *   .add-cart-sec
 *     .productcards   → {children} only swaps
 *     .price-details  → <OrderSummary /> always mounted
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { CartItemData } from "@/services/website/cartService";
import { useCart } from "@/components/website/hooks/useCart";
import { OrderSummary } from "@/components/website/cart/OrderSummary";
import {
  placeOrder,
  type CheckoutPayload,
} from "@/services/website/checkoutService";

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
  notes?: string;
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
  const cart = useCart();

  const [config, setConfig] = useState<OrderSummaryConfig>(() =>
    configForPath(pathname),
  );
  const [confirmDeliveryAddress, setConfirmDeliveryAddress] =
    useState<DeliveryAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const isCheckout = Boolean(pathname?.startsWith("/checkout"));

  useEffect(() => {
    setConfig(configForPath(pathname));
    if (!pathname?.startsWith("/checkout")) {
      setConfirmDeliveryAddress(null);
      setCheckoutError(null);
    }
  }, [pathname]);

  useEffect(() => {
    void cart.fetchCart();
  }, [cart.fetchCart]);

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
        ...confirmDeliveryAddress,
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
      });

      cart.setItems([]);
      setConfirmDeliveryAddress(null);
      router.push(
        `/order-success?order=${encodeURIComponent(order.orderNumber)}`,
      );
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message)
          : "Unable to place order";
      setCheckoutError(message);
    } finally {
      setCheckoutLoading(false);
    }
  }, [confirmDeliveryAddress, cart, paymentMethod, router]);

  const value = useMemo<PlaceOrderContextType>(
    () => ({
      items: cart.items,
      total: cart.total,
      loading: cart.loading,
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
      checkoutLoading,
      checkoutError,
      handlePlaceOrder,
      submitCheckout,
    }),
    [
      cart.items,
      cart.total,
      cart.loading,
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
          {/*
            tid-web: .add-cart-sec → [.productcards | .price-details]
            Same structure on cart AND checkout — never change column template by route.
          */}
          <div className="add-cart-sec place-order-grid">
            <div className="productcards place-order-main cart-main">
              {children}
            </div>
            <div className="price-details cart-detail sticky-summary place-order-summary">
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>
    </PlaceOrderContext.Provider>
  );
}

export default PlaceOrderFlowWrapper;
