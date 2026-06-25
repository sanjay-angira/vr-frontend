"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { MenuItemNode } from "@/types/header";

type DesktopNavigationProps = {
  items: MenuItemNode[];
  textColor: string;
};

export function DesktopNavigation({ items, textColor }: DesktopNavigationProps) {
  if (!items.length) {
    return null;
  }

  return (
    <nav className="nav hidden lg:flex">
      {items.map((item) => (
        <div key={item.id} className="nav-item">
          {item.children.length > 0 ? (
            <>
              <Link
                href={item.url}
                className="nav-button"
                style={{ color: textColor }}
              >
                {item.label}
                <ChevronDown size={16} />
              </Link>
              <div className="dropdown">
                {item.children.map((child) => (
                  <Link
                    key={child.id}
                    href={child.url}
                    className="dropdown-item"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <Link
              href={item.url}
              className="nav-button"
              style={{ color: textColor }}
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
