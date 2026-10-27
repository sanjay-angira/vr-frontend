"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useUserAuth } from "@/services/useUserAuth";
import { AccountChromeSkeleton } from "@/components/account/AccountSkeletons";
import { getAccountMeta } from "@/components/account/accountMeta";

const NAV = [
  { href: "/profile", label: "Profile" },
  { href: "/orders", label: "My orders" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/addresses", label: "Addresses" },
] as const;

export function AccountShell({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useUserAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const { title, skeleton } = useMemo(
    () => getAccountMeta(pathname),
    [pathname],
  );

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (isAuthenticated) return;
    router.replace("/");
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated || !user) {
    return <AccountChromeSkeleton>{skeleton}</AccountChromeSkeleton>;
  }

  return (
    <div className="account-page">
      <div className="account-container">
        <header className="account-header">
          <p className="commerce-eyebrow commerce-eyebrow--blog">My account</p>
          <h1>{title}</h1>
          <p className="commerce-muted">Signed in as {user.name}</p>
        </header>

        <div className="account-layout">
          <nav className="account-nav" aria-label="Account">
            {NAV.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/profile" &&
                  Boolean(pathname?.startsWith(item.href)));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`account-nav-link${active ? " is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
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
