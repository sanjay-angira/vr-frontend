"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/services/redux/hooks";
import { setAuthModalOpen } from "@/services/redux/slices/websiteSlices/modalSlice";
import { useUserAuth } from "@/services/website/useUserAuth";

export function HeaderUser() {
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useUserAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showDropdown) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showDropdown]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    dispatch(setAuthModalOpen(false));
    router.push("/");
  };

  const handleLoginClick = () => {
    dispatch(setAuthModalOpen(true));
  };

  if (!mounted) {
    return (
      <button type="button" className="icon-button" aria-label="Login">
        <User size={20} />
      </button>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="profile-dropdown" ref={dropdownRef}>
        <button
          type="button"
          className="icon-button"
          onClick={() => setShowDropdown((open) => !open)}
          aria-label="Account"
          aria-expanded={showDropdown}
        >
          <User size={20} />
        </button>
        {showDropdown ? (
          <div className="dropdown-menu profile-dropdown-menu">
            <div className="profile-dropdown-name">{user.name}</div>
            <Link
              href="/profile"
              className="dropdown-item"
              onClick={() => setShowDropdown(false)}
            >
              My Profile
            </Link>
            <Link
              href="/orders"
              className="dropdown-item"
              onClick={() => setShowDropdown(false)}
            >
              My Orders
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="dropdown-item logout-btn"
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      className="icon-button"
      onClick={handleLoginClick}
      aria-label="Login"
    >
      <User size={20} />
    </button>
  );
}
