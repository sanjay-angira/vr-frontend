"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { DesktopNavigation } from "@/components/website/header/DesktopNavigation";
import { HeaderLogo } from "@/components/website/header/HeaderLogo";
import { HeaderStaticActions } from "@/components/website/header/HeaderStaticActions";
import { MobileNavigation } from "@/components/website/header/MobileNavigation";
import type { HeaderSettingsData, MenuItemNode } from "@/types/header";

type WebsiteHeaderBarProps = {
  header: HeaderSettingsData;
  menu: MenuItemNode[];
};

export function WebsiteHeaderBar({ header, menu }: WebsiteHeaderBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

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

          <DesktopNavigation items={menu} textColor={header.textColor} />

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
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            ) : null}
          </div>
        </div>
      </div>

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
