"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
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

  if (!isOpen) {
    return null;
  }

  const toggleExpanded = (id: number) => {
    setExpandedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );
  };

  return (
    <div className="mobile-nav-panel">
      <nav className="flex flex-col vr-gap-s">
        {items.map((item) => {
          const hasChildren = item.children.length > 0;
          const isExpanded = expandedIds.includes(item.id);

          return (
            <div key={item.id}>
              <div className="flex items-center justify-between vr-gap-s">
                <Link
                  href={item.url}
                  className="nav-button flex-1 justify-start"
                  style={{ color: textColor }}
                  onClick={onClose}
                >
                  {item.label}
                </Link>
                {hasChildren ? (
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={isExpanded ? "Collapse submenu" : "Expand submenu"}
                    onClick={() => toggleExpanded(item.id)}
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                ) : null}
              </div>

              {hasChildren && isExpanded ? (
                <div className="mt-1 flex flex-col vr-gap-s pl-4">
                  {item.children.map((child) => (
                    <Link
                      key={child.id}
                      href={child.url}
                      className="nav-button is-sub justify-start"
                      style={{ color: textColor }}
                      onClick={onClose}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
