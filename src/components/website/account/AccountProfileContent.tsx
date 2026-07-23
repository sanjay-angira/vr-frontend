"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  UserRound,
} from "lucide-react";
import { AccountShell } from "@/components/website/account/AccountShell";
import { useUserAuth } from "@/services/website/useUserAuth";
import { useAppDispatch } from "@/services/redux/hooks";
import { setAuthModalOpen } from "@/services/redux/slices/websiteSlices/modalSlice";
import { AccountProfileSkeleton } from "@/components/website/account/AccountSkeletons";

function getInitials(name?: string) {
  if (!name?.trim()) return "VR";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "VR";
}

export function AccountProfileContent() {
  const { user, logout } = useUserAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    logout();
    dispatch(setAuthModalOpen(false));
    router.replace("/");
  };

  return (
    <AccountShell title="Profile" skeleton={<AccountProfileSkeleton />}>
      <div className="account-profile">
        <section className="account-profile-hero">
          <div className="account-profile-avatar" aria-hidden>
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt=""
                width={88}
                height={88}
                unoptimized
              />
            ) : (
              <span>{getInitials(user?.name)}</span>
            )}
          </div>
          <div className="account-profile-hero-copy">
            <h2>{user?.name || "Customer"}</h2>
            <p className="commerce-muted">
              Manage your account details and shopping activity.
            </p>
          </div>
        </section>

        <section className="account-profile-card">
          <header className="account-profile-card-head">
            <UserRound size={18} aria-hidden />
            <h3>Account details</h3>
          </header>
          <dl className="account-profile-fields">
            <div>
              <dt>Full name</dt>
              <dd>{user?.name || "—"}</dd>
            </div>
            <div>
              <dt>
                <Phone size={14} aria-hidden />
                Phone
              </dt>
              <dd>{user?.phone || "Not added"}</dd>
            </div>
            <div>
              <dt>
                <Mail size={14} aria-hidden />
                Email
              </dt>
              <dd>{user?.email || "Not added"}</dd>
            </div>
          </dl>
        </section>

        <section className="account-profile-links">
          <Link href="/account/orders" className="account-profile-link">
            <span className="account-profile-link-icon" aria-hidden>
              <Package size={18} />
            </span>
            <span>
              <strong>My orders</strong>
              <em>Track deliveries and past purchases</em>
            </span>
            <ChevronRight size={18} aria-hidden />
          </Link>
          <Link href="/account/addresses" className="account-profile-link">
            <span className="account-profile-link-icon" aria-hidden>
              <MapPin size={18} />
            </span>
            <span>
              <strong>Addresses</strong>
              <em>Saved delivery locations</em>
            </span>
            <ChevronRight size={18} aria-hidden />
          </Link>
        </section>

        <button
          type="button"
          className="account-logout-btn"
          onClick={handleLogout}
        >
          <LogOut size={16} aria-hidden />
          Sign out
        </button>
      </div>
    </AccountShell>
  );
}
