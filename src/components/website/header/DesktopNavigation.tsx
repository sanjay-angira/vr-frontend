import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { MenuItemNode } from "@/types/header";

type DesktopNavigationProps = {
  items: MenuItemNode[];
  textColor: string;
};

function NavLink({
  href,
  className,
  style,
  children,
}: {
  href: string;
  className: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={className} style={style}>
      {children}
    </Link>
  );
}

export function DesktopNavigation({ items, textColor }: DesktopNavigationProps) {
  if (!items.length) {
    return null;
  }

  return (
    <nav className="nav">
      {items.map((item) => (
        <div key={item.id} className="nav-item">
          {item.children.length > 0 ? (
            <>
              <NavLink
                href={item.url}
                className="nav-button"
                style={{ color: textColor }}
              >
                {item.label}
                <ChevronDown size={16} />
              </NavLink>
              <div className="dropdown">
                {item.children.map((child) => (
                  <NavLink
                    key={child.id}
                    href={child.url}
                    className="dropdown-item"
                  >
                    {child.label}
                  </NavLink>
                ))}
              </div>
            </>
          ) : (
            <NavLink
              href={item.url}
              className="nav-button"
              style={{ color: textColor }}
            >
              {item.label}
            </NavLink>
          )}
        </div>
      ))}
    </nav>
  );
}
