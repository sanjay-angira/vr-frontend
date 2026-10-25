export function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export const FREE_SHIPPING_THRESHOLD = 499;

export function getCartCounts(items: { quantity: number }[]) {
  const itemCount = items.length;
  const unitCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { itemCount, unitCount };
}

export function formatItemCountLabel(itemCount: number, unitCount: number) {
  return `${itemCount} item${itemCount === 1 ? "" : "s"} · ${unitCount} unit${unitCount === 1 ? "" : "s"}`;
}

/** Offer-aware unit + line totals for a cart item (matches product-page pricing). */
export function getCartItemPricing(item: {
  quantity: number;
  priceAtTime: number;
  sellingPrice?: number | null;
  finalPrice?: number | null;
  subtotal?: number;
  appliedOffer?: { offerName?: string } | null;
}) {
  const unit =
    Number(item.finalPrice ?? item.priceAtTime) ||
    Number(item.priceAtTime) ||
    0;
  const listUnit =
    Number(item.sellingPrice) > unit ? Number(item.sellingPrice) : unit;
  const line = Number(item.subtotal) || unit * Number(item.quantity || 0);
  const listLine = listUnit * Number(item.quantity || 0);
  const hasDiscount = listUnit > unit && unit > 0;

  return {
    unit,
    listUnit,
    line,
    listLine,
    hasDiscount,
    offerName: item.appliedOffer?.offerName || null,
  };
}

/** Shared bag totals for Order Summary (tid Shipmentdetail-style breakdown). */
export function getOrderSummaryTotals(
  items: Array<{
    quantity: number;
    priceAtTime: number;
    sellingPrice?: number | null;
    finalPrice?: number | null;
    subtotal?: number;
  }>,
  couponDiscount = 0,
) {
  const { itemCount, unitCount } = getCartCounts(items);

  let listTotal = 0;
  let payableTotal = 0;

  for (const item of items) {
    const { listLine, line } = getCartItemPricing(item);
    listTotal += listLine;
    payableTotal += line;
  }

  const offerDiscount = Math.max(0, listTotal - payableTotal);
  const safeCouponDiscount = Math.min(
    payableTotal,
    Math.max(0, Number(couponDiscount) || 0),
  );
  const finalPayable = Math.max(0, payableTotal - safeCouponDiscount);
  const discount = offerDiscount + safeCouponDiscount;

  return {
    itemCount,
    unitCount,
    listTotal,
    payableTotal: finalPayable,
    merchandiseTotal: payableTotal,
    offerDiscount,
    couponDiscount: safeCouponDiscount,
    discount,
  };
}
