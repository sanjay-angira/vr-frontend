"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Search } from "lucide-react";
import { useAppDispatch } from "@/services/redux/hooks";
import { fetchWebsiteCart } from "@/services/redux/slices/websiteSlices/cartSlice";
import { useIsMobile } from "@/components/website/hooks/use-mobile";
import { HeaderCart } from "@/components/website/layout/HeaderCart";
import { HeaderUser } from "@/components/website/layout/HeaderUser";

const categories = [
  { name: "Rudraksha", href: "/rudraksha" },
  { name: "Sweets", href: "/sweets" },
  { name: "Books", href: "/books" },
  { name: "Rashi", href: "/rashi" },
];

export function WebsiteHeader() {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchWebsiteCart());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link href="/" className="logo">
            <div className="logo-icon">🕉</div>
            <span className="logo-text">Vrindavan Rasa</span>
          </Link>

          <nav className="nav">
            <Link href="/" className="nav-button">
              Home
            </Link>
          <Link href="/shop" className="nav-button">
            Shop
          </Link>
            {categories.map((category) => (
              <Link key={category.name} href={category.href} className="nav-button">
                {category.name}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <Link href="/search" className="icon-button" aria-label="Search">
              <Search size={20} />
            </Link>
            <HeaderCart />
            <HeaderUser />
            <button
              type="button"
              className="icon-button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ display: isMobile ? "block" : "none" }}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="mobile-nav-panel" ref={dropdownRef}>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <Link href="/" className="nav-button" onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </Link>
              <Link href="/shop" className="nav-button" onClick={() => setIsMobileMenuOpen(false)}>
                Shop
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="nav-button is-category"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
