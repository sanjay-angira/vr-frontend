import type { PlacedOrder } from "@/services/website/checkoutService";

export function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function getOrderMoney(order: PlacedOrder) {
  const listSubtotal = Number(
    order.listSubtotal ??
      order.offerJson?.listSubtotal ??
      order.items.reduce(
        (sum, item) =>
          sum +
          Number(
            item.listSubtotal ??
              (item.listUnitPrice ?? item.unitPrice) * item.quantity,
          ),
        0,
      ),
  );
  const payableSubtotal = Number(
    order.offerJson?.payableSubtotal ?? order.subtotal,
  );
  const discountTotal = Number(
    order.discountTotal ??
      order.offerJson?.discountTotal ??
      Math.max(0, listSubtotal - payableSubtotal),
  );
  const shippingFee = Number(order.shippingFee || 0);
  const total = Number(order.total);

  return {
    listSubtotal,
    payableSubtotal,
    discountTotal,
    shippingFee,
    total,
    hasDiscount: discountTotal > 0.009,
  };
}

export function getOrderItemMoney(item: PlacedOrder["items"][number]) {
  const listUnit = Number(item.listUnitPrice ?? item.unitPrice);
  const unit = Number(item.unitPrice);
  const listLine = Number(
    item.listSubtotal ?? listUnit * Number(item.quantity || 0),
  );
  const payableLine = Number(item.subtotal);
  const discount = Number(
    item.discountAmount != null
      ? Number(item.discountAmount) * Number(item.quantity || 0)
      : Math.max(0, listLine - payableLine),
  );

  return {
    listUnit,
    unit,
    listLine,
    payableLine,
    discount,
    hasDiscount: listLine > payableLine + 0.009,
    offerName: item.appliedOffer?.offerName || null,
  };
}
