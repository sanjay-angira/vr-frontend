"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { MenuItemNode } from "@/types/header";

type MobileNavigationProps = {
  items: MenuItemNode[];
  textColor: string;
  isOpen: boolean;
  onClose: () => void;
};

export function MobileNavigation({
  items,
  textColor,
  isOpen,
  onClose,
}: MobileNavigationProps) {
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setExpandedIds([]);
    }
  }, [isOpen]);

  const toggleExpanded = (id: number) => {
    setExpandedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );
  };

  return (
    <nav className="mobile-nav-list" aria-label="Mobile navigation">
      {items.map((item, index) => {
        const hasChildren = item.children.length > 0;
        const isExpanded = expandedIds.includes(item.id);

        return (
          <div
            key={item.id}
            className="mobile-nav-item"
            style={{ ["--nav-i" as string]: index }}
          >
            <div className="mobile-nav-row">
              <Link
                href={item.url}
                className="nav-button mobile-nav-link"
                style={{ color: textColor }}
                tabIndex={isOpen ? 0 : -1}
                onClick={onClose}
              >
                {item.label}
              </Link>
              {hasChildren ? (
                <button
                  type="button"
                  className={`icon-button mobile-nav-expand${isExpanded ? " is-expanded" : ""}`}
                  aria-label={isExpanded ? "Collapse submenu" : "Expand submenu"}
                  aria-expanded={isExpanded}
                  tabIndex={isOpen ? 0 : -1}
                  onClick={() => toggleExpanded(item.id)}
                >
                  <ChevronDown size={18} />
                </button>
              ) : null}
            </div>

            {hasChildren ? (
              <div
                className={`mobile-nav-submenu${isExpanded ? " is-open" : ""}`}
              >
                <div className="mobile-nav-submenu-inner">
                  {item.children.map((child) => (
                    <Link
                      key={child.id}
                      href={child.url}
                      className="nav-button is-sub mobile-nav-link"
                      style={{ color: textColor }}
                      tabIndex={isOpen && isExpanded ? 0 : -1}
                      onClick={onClose}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
