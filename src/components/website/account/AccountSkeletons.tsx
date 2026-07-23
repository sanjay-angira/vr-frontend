type SkeletonProps = {
  count?: number;
};

function SkeletonLines({
  widths = ["w-70", "w-40", "w-30"],
}: {
  widths?: Array<"w-30" | "w-40" | "w-70">;
}) {
  return (
    <>
      {widths.map((width, index) => (
        <div key={`${width}-${index}`} className={`skeleton-line ${width}`} />
      ))}
    </>
  );
}

export function AccountOrdersSkeleton({ count = 3 }: SkeletonProps) {
  return (
    <ul className="account-order-list" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }, (_, index) => (
        <li key={`order-skel-${index}`} className="account-order-card is-skeleton">
          <div className="account-order-card-link account-skeleton-order">
            <div className="account-order-thumb skeleton-block account-skeleton-thumb" />
            <div className="account-order-body">
              <SkeletonLines widths={["w-40", "w-70", "w-30"]} />
            </div>
          </div>
        </li>
      ))}
    </ul>
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
