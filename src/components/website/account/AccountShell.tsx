"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAppDispatch } from "@/services/redux/hooks";
import { setAuthModalOpen } from "@/services/redux/slices/websiteSlices/modalSlice";
import { useUserAuth } from "@/services/website/useUserAuth";

const NAV = [
  { href: "/account/profile", label: "Profile" },
  { href: "/account/orders", label: "My orders" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/addresses", label: "Addresses" },
];

export function AccountShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { isAuthenticated, user } = useUserAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthenticated) return;
    dispatch(setAuthModalOpen(true));
    router.replace("/");
  }, [isAuthenticated, dispatch, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="account-page">
        <div className="account-container">
          <p className="commerce-muted">Please log in to view your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="account-container">
        <header className="account-header">
          <p className="commerce-eyebrow">My account</p>
          <h1>{title}</h1>
          <p className="commerce-muted">Signed in as {user.name}</p>
        </header>

        <div className="account-layout">
          <nav className="account-nav" aria-label="Account">
            {NAV.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/account/profile" &&
                  pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`account-nav-link${active ? " is-active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="account-main">{children}</div>
        </div>
      </div>
    </div>
  );
}
