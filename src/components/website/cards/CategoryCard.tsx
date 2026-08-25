"use client";

import Image from "next/image";
import {
  ArrowRight,
  Cookie,
  CupSoda,
  Droplets,
  Flame,
  Flower2,
  HeartPulse,
  Leaf,
  Nut,
  ShoppingBasket,
  Soup,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import { ShopSeedLink } from "@/components/website/shop/ShopSeedLink";

export interface Category {
  id: number;
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  mobileImage?: string;
  productCount?: number;
  href?: string;
}

function resolveCategoryIcon(name?: string): LucideIcon {
  const key = (name || "").toLowerCase();

  if (/sweet|mithai|dessert|ladoo|halwa|laddu/.test(key)) return Cookie;
  if (/pooja|puja|worship|ritual|incense/.test(key)) return Flame;
  if (/dry fruit|nut|almond|cashew|pista/.test(key)) return Nut;
  if (/spice|masala|seasoning|herb/.test(key)) return Flower2;
  if (/snack|namkeen|mixture|chips/.test(key)) return Soup;
  if (/personal|care|oil|cosmetic|skin/.test(key)) return Droplets;
  if (/wellness|health|ayurved/.test(key)) return HeartPulse;
  if (/tea|coffee|drink|beverage|juice/.test(key)) return CupSoda;
  if (/flour|atta|grain|rice|dal|pulse/.test(key)) return Wheat;
  if (/food|grocery|kitchen|cook|ready|meal/.test(key)) return ShoppingBasket;

  return Leaf;
}

export function CategoryCard({ category }: { category: Category }) {
  const Icon = resolveCategoryIcon(category.name);
  const slug = category.slug?.trim();
  const seed = slug ? { categorySlugs: [slug] } : undefined;
  const href =
    category.href ||
    (slug ? `/category/${encodeURIComponent(slug)}` : "/products");
  const desktopSrc = category.image || category.mobileImage || "";
  const mobileSrc = category.mobileImage || category.image || "";
  const hasDistinctMobile = Boolean(
    mobileSrc && desktopSrc && mobileSrc !== desktopSrc
  );

  return (
    <ShopSeedLink href={href} seed={seed} className="category-card">
      <div className="category-card-media">
        <div className="category-card-media-frame">
          {desktopSrc ? (
            hasDistinctMobile ? (
              <>
                <div className="category-card-variant category-card-variant--mobile">
                  <Image
                    src={mobileSrc}
                    alt={category.name || "Category"}
                    fill
                    sizes="(max-width: 899px) 50vw, 25vw"
                    className="category-card-image"
                  />
                </div>
                <div className="category-card-variant category-card-variant--desktop">
                  <Image
                    src={desktopSrc}
                    alt={category.name || "Category"}
                    fill
                    sizes="25vw"
                    className="category-card-image"
                  />
                </div>
              </>
            ) : (
              <Image
                src={desktopSrc}
                alt={category.name || "Category"}
                fill
                sizes="(max-width: 899px) 50vw, 25vw"
                className="category-card-image"
              />
            )
          ) : (
            <div className="category-card-image category-card-image--placeholder" />
          )}
        </div>

        <span className="category-card-icon" aria-hidden>
          <Icon size={16} strokeWidth={1.65} />
        </span>
      </div>

      <div className="category-card-content">
        <h3 className="category-card-title">{category.name}</h3>

        {category.description ? (
          <p className="category-card-description">{category.description}</p>
        ) : null}

        <span className="category-card-cta">
          <span className="category-card-cta-full">Explore Collection</span>
          <span className="category-card-cta-short">Explore</span>
          <ArrowRight size={14} className="category-card-cta-icon" />
        </span>
      </div>
    </ShopSeedLink>
  );
}
