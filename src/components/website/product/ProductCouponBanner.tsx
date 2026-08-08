"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { WebsiteCoupon } from "@/services/website/couponService";
import { addOrUpdateCartItem } from "@/services/website/cartService";
import { useDispatch } from "react-redux";
import { fetchWebsiteCart } from "@/services/redux/slices/websiteSlices/cartSlice";

type ProductCouponBannerProps = {
  coupons: WebsiteCoupon[];
  /** Selected product variant id — used to add to cart before applying coupon (TID pattern). */
  variantId?: number | null;
};

function CouponBannerCard({
  coupon,
  variantId,
}: {
  coupon: WebsiteCoupon;
  variantId?: number | null;
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const image = coupon.image?.trim();

  if (!image) return null;

  const handleClick = async () => {
    const target = `/cart?coupon=${encodeURIComponent(coupon.couponCode)}`;

    if (variantId) {
      try {
        await addOrUpdateCartItem(variantId, 1);
        // @ts-ignore
        dispatch(fetchWebsiteCart());
      } catch (error) {
        console.error("Unable to add product before applying coupon", error);
      }
    }

    router.push(target);
  };

  return (
    <button
      type="button"
      className="product-coupon-banner product-coupon-banner--image-only"
      onClick={() => void handleClick()}
      aria-label={`Apply coupon ${coupon.couponCode}`}
    >
      <Image
        src={image}
        alt={coupon.couponCode}
        width={1200}
        height={300}
        className="product-coupon-banner__full-image"
        sizes="(max-width: 768px) 100vw, 720px"
        style={{ width: "100%", height: "auto" }}
      />
    </button>
  );
}

export function ProductCouponBanner({
  coupons,
  variantId = null,
}: ProductCouponBannerProps) {
  const withImages = coupons.filter((coupon) => Boolean(coupon.image?.trim()));
  if (!withImages.length) return null;

  return (
    <div className="product-coupon-banner-stack">
      {withImages.map((coupon) => (
        <CouponBannerCard
          key={coupon.id}
          coupon={coupon}
          variantId={variantId}
        />
      ))}
    </div>
  );
}
