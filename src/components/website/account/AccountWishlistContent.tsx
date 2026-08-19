"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { AccountWishlistSkeleton } from "@/components/website/account/AccountSkeletons";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";
import { useAppDispatch, useAppSelector } from "@/services/redux/hooks";
import {
  fetchWishlistItems,
  removeWishlistEntry,
} from "@/services/redux/slices/websiteSlices/wishlistSlice";
import { fetchWebsiteCart } from "@/services/redux/slices/websiteSlices/cartSlice";
import { addOrUpdateCartItem } from "@/services/website/cartService";
import type { WishlistItem } from "@/services/website/wishlistService";

export function AccountWishlistContent() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.wishlist.items);
  const loading = useAppSelector((state) => state.wishlist.loading);
  const mutating = useAppSelector((state) => state.wishlist.mutating);
  const [movingId, setMovingId] = useState<number | null>(null);

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 0,
      }),
    [],
  );

  const loadWishlist = useCallback(async () => {
    try {
      await dispatch(fetchWishlistItems()).unwrap();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load wishlist",
      );
    }
  }, [dispatch]);

  useEffect(() => {
    void loadWishlist();
  }, [loadWishlist]);

  const handleRemove = async (item: WishlistItem) => {
    try {
      await dispatch(
        removeWishlistEntry({ id: item.id, variationId: item.variationId }),
      ).unwrap();
      toast.success("Removed from wishlist");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove item",
      );
    }
  };

  const handleMoveToCart = async (item: WishlistItem) => {
    if (!item.inStock) {
      toast.error("This item is currently out of stock");
      return;
    }

    try {
      setMovingId(item.id);
      await addOrUpdateCartItem(item.variationId, 1);
      void dispatch(fetchWebsiteCart());
      await dispatch(
        removeWishlistEntry({ id: item.id, variationId: item.variationId }),
      ).unwrap();
      toast.success("Moved to cart");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to move to cart",
      );
    } finally {
      setMovingId(null);
    }
  };

  return (
    <>
      {loading && items.length === 0 ? (
        <AccountWishlistSkeleton />
      ) : items.length === 0 ? (
        <div className="account-empty">
          <div className="account-empty-icon" aria-hidden>
            <Heart size={28} />
          </div>
          <h2>Your wishlist is empty</h2>
          <p className="commerce-muted">
            Save products you love and find them here anytime.
          </p>
          <Link href="/products" className="btn btn-primary">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="account-wishlist">
          <div className="account-wishlist-toolbar">
            <p className="commerce-muted">
              {items.length} {items.length === 1 ? "item" : "items"} saved
            </p>
          </div>

          <ul className="account-wishlist-list">
            {items.map((item) => {
              const href = item.productSlug
                ? `/product/${item.productSlug}`
                : undefined;
              const image =
                resolveImageUrl(item.image || "") || "/next.svg";
              const listPrice = Number(item.sellingPrice || 0);
              const finalPrice = Number(item.finalPrice || 0);
              const hasDiscount =
                listPrice > finalPrice && finalPrice > 0;
              const title = [item.productName, item.variantName]
                .filter(Boolean)
                .join(" · ");

              return (
                <li key={item.id} className="account-wishlist-item">
                  <div className="account-wishlist-media">
                    {href ? (
                      <Link href={href} aria-label={title}>
                        <Image
                          src={image}
                          alt={title}
                          fill
                          sizes="88px"
                          className="account-wishlist-thumb"
                        />
                      </Link>
                    ) : (
                      <Image
                        src={image}
                        alt={title}
                        fill
                        sizes="88px"
                        className="account-wishlist-thumb"
                      />
                    )}
                  </div>

                  <div className="account-wishlist-body">
                    <h3 className="account-wishlist-title">
                      {href ? <Link href={href}>{title}</Link> : title}
                    </h3>

                    <div className="account-wishlist-price">
                      <span>₹{priceFormatter.format(finalPrice)}</span>
                      {hasDiscount ? (
                        <span className="account-wishlist-mrp">
                          ₹{priceFormatter.format(listPrice)}
                        </span>
                      ) : null}
                    </div>

                    <p
                      className={`account-wishlist-stock ${
                        item.inStock ? "is-in" : "is-out"
                      }`}
                    >
                      {item.inStock ? "In stock" : "Out of stock"}
                    </p>
                  </div>

                  <div className="account-wishlist-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={
                        !item.inStock ||
                        movingId === item.id ||
                        mutating
                      }
                      onClick={() => void handleMoveToCart(item)}
                    >
                      <ShoppingCart size={16} />
                      {movingId === item.id ? "Moving…" : "Move to cart"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={mutating || movingId === item.id}
                      onClick={() => void handleRemove(item)}
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
