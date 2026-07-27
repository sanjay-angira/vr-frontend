import type { ReactNode } from "react";

type SkeletonProps = {
  count?: number;
};

const NAV_SLOTS = 4;

function SkeletonLines({
  widths = ["w-70", "w-40", "w-30"],
}: {
  widths?: Array<"w-30" | "w-40" | "w-70">;
}) {
  return (
    <div className="account-skeleton-lines">
      {widths.map((width, index) => (
        <div key={`${width}-${index}`} className={`skeleton-line ${width}`} />
      ))}
    </div>
  );
}

/** Full-page chrome used by AccountShell hydrate + Next.js loading.tsx */
export function AccountChromeSkeleton({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <div className="account-page" aria-busy="true" aria-live="polite">
      <div className="account-container">
        <header className="account-header account-header--skeleton">
          <div className="skeleton-line w-30" />
          <div className="skeleton-line account-skeleton-title" />
          <div className="skeleton-line w-40" />
        </header>

        <div className="account-layout">
          <nav className="account-nav" aria-hidden>
            {Array.from({ length: NAV_SLOTS }, (_, index) => (
              <div key={`nav-skel-${index}`} className="account-nav-link is-skeleton">
                <div className="skeleton-line w-70" />
              </div>
            ))}
          </nav>
          <div className="account-main">
            {children ?? <AccountProfileSkeleton />}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AccountOrdersSkeleton({ count = 3 }: SkeletonProps) {
  return (
    <ul className="account-order-list" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }, (_, index) => (
        <li key={`order-skel-${index}`} className="account-order-card is-skeleton">
          <div className="account-order-card-link account-skeleton-order">
            <div className="skeleton-block account-skeleton-thumb" />
            <div className="account-order-body">
              <SkeletonLines widths={["w-40", "w-70", "w-30"]} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AccountOrderDetailSkeleton() {
  return (
    <div className="account-order-detail is-skeleton" aria-busy="true" aria-live="polite">
      <div className="skeleton-line w-30 account-skeleton-back" />

      <div className="account-order-detail-head account-skeleton-detail-head">
        <div className="account-skeleton-detail-copy">
          <SkeletonLines widths={["w-40", "w-30"]} />
        </div>
        <div className="account-order-detail-badges account-skeleton-detail-badges">
          <div className="skeleton-block account-skeleton-badge" />
          <div className="skeleton-block account-skeleton-badge" />
        </div>
      </div>

      <section className="account-profile-card is-skeleton">
        <div className="skeleton-line w-40" />
        <div className="account-skeleton-detail-items">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={`detail-item-${index}`} className="account-skeleton-detail-item">
              <div className="skeleton-block account-skeleton-thumb" />
              <SkeletonLines widths={["w-70", "w-40", "w-30"]} />
            </div>
          ))}
        </div>
      </section>

      <section className="account-profile-card is-skeleton">
        <div className="skeleton-line w-40" />
        <div className="account-skeleton-profile-fields">
          <SkeletonLines widths={["w-70", "w-40", "w-70", "w-30"]} />
        </div>
      </section>
    </div>
  );
}

export function AccountAddressesSkeleton({ count = 3 }: SkeletonProps) {
  return (
    <ul className="account-address-list" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }, (_, index) => (
        <li
          key={`address-skel-${index}`}
          className="account-address-card is-skeleton"
        >
          <div className="account-skeleton-address-body">
            <SkeletonLines widths={["w-40", "w-70", "w-70", "w-30"]} />
          </div>
          <div className="account-address-actions account-skeleton-actions">
            <div className="skeleton-line w-30" />
            <div className="skeleton-line w-40" />
            <div className="skeleton-line w-30" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AccountWishlistSkeleton({ count = 3 }: SkeletonProps) {
  return (
    <ul className="account-wishlist-list" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }, (_, index) => (
        <li
          key={`wishlist-skel-${index}`}
          className="account-wishlist-item is-skeleton"
        >
          <div className="account-wishlist-media skeleton-block" />
          <div className="account-wishlist-body">
            <SkeletonLines widths={["w-70", "w-30", "w-40"]} />
          </div>
          <div className="account-wishlist-actions account-skeleton-actions">
            <div className="skeleton-block account-skeleton-btn" />
            <div className="skeleton-block account-skeleton-btn" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AccountProfileSkeleton() {
  return (
    <div className="account-profile" aria-busy="true" aria-live="polite">
      <section className="account-profile-hero is-skeleton">
        <div className="account-profile-avatar skeleton-block account-skeleton-avatar" />
        <div className="account-profile-hero-copy">
          <SkeletonLines widths={["w-40", "w-70"]} />
        </div>
      </section>

      <section className="account-profile-card is-skeleton">
        <div className="skeleton-line w-40" />
        <div className="account-skeleton-profile-fields">
          <SkeletonLines widths={["w-70", "w-40", "w-70"]} />
        </div>
      </section>

      <section className="account-profile-links">
        <div className="account-profile-link is-skeleton">
          <div className="skeleton-block account-skeleton-icon" />
          <div className="account-skeleton-link-copy">
            <SkeletonLines widths={["w-40", "w-70"]} />
          </div>
        </div>
        <div className="account-profile-link is-skeleton">
          <div className="skeleton-block account-skeleton-icon" />
          <div className="account-skeleton-link-copy">
            <SkeletonLines widths={["w-40", "w-70"]} />
          </div>
        </div>
      </section>

      <div className="skeleton-block account-skeleton-logout" />
    </div>
  );
}
