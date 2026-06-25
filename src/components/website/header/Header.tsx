"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Menu, Search } from "lucide-react";
import { useAppDispatch } from "@/services/redux/hooks";
import { fetchWebsiteCart } from "@/services/redux/slices/websiteSlices/cartSlice";
import { HeaderCart } from "@/components/website/layout/HeaderCart";
import { HeaderUser } from "@/components/website/layout/HeaderUser";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";
import type { HeaderSettingsData, MenuItemNode } from "@/types/header";
import { DesktopNavigation } from "./DesktopNavigation";
import { MobileNavigation } from "./MobileNavigation";

type HeaderProps = {
  settings: HeaderSettingsData;
  menu: MenuItemNode[];
};

export function Header({ settings, menu }: HeaderProps) {
  const dispatch = useAppDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchWebsiteCart());
  }, [dispatch]);

  const logoSrc = settings.logoUrl ? resolveImageUrl(settings.logoUrl) : "";

  return (
    <header
      className="header"
      style={{
        position: settings.stickyHeader ? "sticky" : "relative",
        top: settings.stickyHeader ? 0 : undefined,
        backgroundColor: settings.backgroundColor,
        color: settings.textColor,
        ["--header-bg" as string]: settings.backgroundColor,
        ["--header-text" as string]: settings.textColor,
      }}
    >
      <div className="container">
        <div className="header-content">
          <Link href="/" className="logo" style={{ color: settings.textColor }}>
            {logoSrc ? (
              <Image
                src={logoSrc}
                alt="Store logo"
                width={140}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            ) : (
              <>
                <div className="logo-icon">🕉</div>
                <span className="logo-text">Vrindavan Rasa</span>
              </>
            )}
          </Link>

          <DesktopNavigation items={menu} textColor={settings.textColor} />

          <div className="header-actions">
            {settings.showSearch ? (
              <Link href="/search" className="icon-button" aria-label="Search">
                <Search size={20} />
              </Link>
            ) : null}

            {settings.showWishlist ? (
              <Link
                href="/account/wishlist"
                className="icon-button"
                aria-label="Wishlist"
              >
                <Heart size={20} />
              </Link>
            ) : null}

            {settings.showCart ? <HeaderCart /> : null}
            {settings.showAccount ? <HeaderUser /> : null}

            <button
              type="button"
              className="icon-button lg:hidden"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        <MobileNavigation
          items={menu}
          textColor={settings.textColor}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>
    </header>
  );
}
