"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch } from "@/services/redux/hooks";
import { setAuthModalOpen } from "@/services/redux/slices/websiteSlices/modalSlice";
import { useUserAuth } from "@/services/website/useUserAuth";
import { isAuthPagePath } from "@/utils/authRoutes";

export function HeaderUser() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useUserAuth();

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    router.push("/");
  };

  const handleLoginClick = () => {
    if (isAuthPagePath(pathname)) {
      return;
    }
    dispatch(setAuthModalOpen(true));
  };

  if (isAuthenticated && user) {
    return (
      <div className="profile-dropdown" ref={dropdownRef}>
        <button
          type="button"
          className="main-nav-link profile-btn"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {user.name}
        </button>
        {showDropdown && (
          <div className="dropdown-menu">
            <Link href="/account/profile" className="dropdown-item">
              My Profile
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="dropdown-item logout-btn"
            >
              Logout
            </button>
          </div>
        )}
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
