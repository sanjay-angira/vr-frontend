"use client";

import { ChevronDown, Heart, Search, ShoppingCart, User } from "lucide-react";
import { HeaderLogo } from "@/components/website/header/HeaderLogo";
import type { MenuItemNode, WebsiteHeaderData } from "@/types/header";

type HeaderPreviewContentProps = {
  data: WebsiteHeaderData;
};

function PreviewNavItem({
  item,
  textColor,
}: {
  item: MenuItemNode;
  textColor: string;
}) {
  return (
    <div className="nav-item">
      {item.children.length > 0 ? (
        <>
          <span className="nav-button" style={{ color: textColor }}>
            {item.label}
            <ChevronDown size={16} />
          </span>
          <div className="dropdown">
            {item.children.map((child) => (
              <span key={child.id} className="dropdown-item">
                {child.label}
              </span>
            ))}
          </div>
        </>
      ) : (
        <span className="nav-button" style={{ color: textColor }}>
          {item.label}
        </span>
      )}
    </div>
  );
}

export function HeaderPreviewContent({ data }: HeaderPreviewContentProps) {
  const { announcementBar, header, menu } = data;

  return (
    <div className="website-header-preview border border-zinc-200">
      {announcementBar?.isActive && announcementBar.message ? (
        <div
          className="announcement-bar"
          style={{
            backgroundColor: announcementBar.backgroundColor,
            color: announcementBar.textColor,
            ["--announcement-bg" as string]: announcementBar.backgroundColor,
            ["--announcement-text" as string]: announcementBar.textColor,
          }}
        >
          <div className="container">
            <div
              className="announcement-bar-content"
              style={{ justifyContent: "center", height: "40px" }}
            >
              <p
                className="m-0 text-center text-sm font-medium"
                style={{ color: announcementBar.textColor }}
              >
                {announcementBar.message}
                {announcementBar.linkText && announcementBar.linkUrl ? (
                  <>
                    {" "}
                    <span
                      className="underline underline-offset-2"
                      style={{ color: announcementBar.textColor }}
                    >
                      {announcementBar.linkText}
                    </span>
                  </>
                ) : null}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <header
        className="header"
        style={{
          position: "relative",
          backgroundColor: header.backgroundColor,
          color: header.textColor,
          ["--header-bg" as string]: header.backgroundColor,
          ["--header-text" as string]: header.textColor,
        }}
      >
        <div className="container">
          <div className="header-content">
            <HeaderLogo
              logoUrl={header.logoUrl}
              mobileLogoUrl={header.mobileLogoUrl}
              textColor={header.textColor}
            />

            {menu.length > 0 ? (
              <nav className="nav">
                {menu.map((item) => (
                  <PreviewNavItem
                    key={item.id}
                    item={item}
                    textColor={header.textColor}
                  />
                ))}
              </nav>
            ) : null}

            <div className="header-actions">
              {header.showSearch ? (
                <span className="icon-button" aria-hidden>
                  <Search size={20} />
                </span>
              ) : null}
              {header.showWishlist ? (
                <span className="icon-button" aria-hidden>
                  <Heart size={20} />
                </span>
              ) : null}
              {header.showCart ? (
                <span className="icon-button" aria-hidden>
                  <ShoppingCart size={20} />
                </span>
              ) : null}
              {header.showAccount ? (
                <span className="icon-button" aria-hidden>
                  <User size={20} />
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
