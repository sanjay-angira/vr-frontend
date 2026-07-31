type ProductGridSkeletonProps = {
  count?: number;
};

/** Product card grid skeleton — matches `.home-product-grid` / `.product-card` footprint. */
export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <div
      className="home-skeleton__product-grid"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading products"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`product-grid-skel-${index}`}
          className="home-skeleton__product-card"
        >
          <div className="home-skeleton__product-image store-skeleton-shimmer" />
          <div className="home-skeleton__product-body">
            <div className="store-skeleton-line store-skeleton-shimmer short" />
            <div className="store-skeleton-line store-skeleton-shimmer" />
            <div className="store-skeleton-line store-skeleton-shimmer medium" />
            <div className="home-skeleton__product-meta">
              <div className="store-skeleton-line store-skeleton-shimmer short" />
              <div className="store-skeleton-line store-skeleton-shimmer short" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
