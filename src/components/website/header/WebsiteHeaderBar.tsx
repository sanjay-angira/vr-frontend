"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { HeaderCategoryNav } from "@/components/website/header/HeaderCategoryNav";
import { HeaderLogo } from "@/components/website/header/HeaderLogo";
import { HeaderSearch } from "@/components/website/header/HeaderSearch";
import { HeaderStaticActions } from "@/components/website/header/HeaderStaticActions";
import { MobileNavigation } from "@/components/website/header/MobileNavigation";
import type { HeaderParentCategory } from "@/components/website/categories/categoriesApi";
import { STATIC_WEBSITE_HEADER } from "@/types/header";

type WebsiteHeaderBarProps = {
  categories: HeaderParentCategory[];
};

export function WebsiteHeaderBar({ categories }: WebsiteHeaderBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const header = STATIC_WEBSITE_HEADER;
  const menu = categories.map((category) => ({
    id: category.id,
    label: category.name,
    url: category.href,
    children: [],
  }));

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [menuOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1024) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <div className="container">
        <div className="header-content">
          <HeaderLogo
            logoUrl={header.logoUrl}
            mobileLogoUrl={header.mobileLogoUrl}
            textColor={header.textColor}
          />

          <div className="header-tools">
            <HeaderSearch />

            <div className="header-actions">
              <HeaderStaticActions settings={header} />
              {menu.length > 0 ? (
                <button
                  type="button"
                  className="icon-button header-menu-toggle"
                  aria-label={menuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={menuOpen}
                  aria-controls="mobile-navigation"
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <HeaderCategoryNav categories={categories} />

      {menu.length > 0 ? (
        <div
          id="mobile-navigation"
          className={`mobile-nav-overlay${menuOpen ? " is-open" : ""}`}
          aria-hidden={!menuOpen}
        >
          <button
            type="button"
            className="mobile-nav-backdrop"
            tabIndex={menuOpen ? 0 : -1}
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="mobile-nav-panel">
            <div className="container">
              <MobileNavigation
                items={menu}
                textColor={header.textColor}
                isOpen={menuOpen}
                onClose={() => setMenuOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
