export function ProductDetailSkeleton() {
  return (
    <div
      className="container product-page-shell product-detail-skeleton"
      style={{ paddingTop: "1.25rem", paddingBottom: "3rem" }}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="product-detail-skeleton__breadcrumbs">
        <div className="store-skeleton-line store-skeleton-shimmer short" />
      </div>

      <div className="product-detail-skeleton__grid">
        <div className="product-detail-skeleton__gallery">
          <div className="product-detail-skeleton__main-image store-skeleton-shimmer" />
          <div className="product-detail-skeleton__thumbs">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`product-thumb-${index}`}
                className="product-detail-skeleton__thumb store-skeleton-shimmer"
              />
            ))}
          </div>
        </div>

        <div className="product-detail-skeleton__content">
          <div className="product-detail-skeleton__chips">
            <div className="product-detail-skeleton__chip store-skeleton-shimmer" />
            <div className="product-detail-skeleton__chip store-skeleton-shimmer" />
          </div>
          <div className="store-skeleton-line store-skeleton-shimmer" style={{ height: 28 }} />
          <div className="store-skeleton-line store-skeleton-shimmer medium" />
          <div className="product-detail-skeleton__price-block store-skeleton-shimmer" />
          <div className="product-detail-skeleton__options store-skeleton-shimmer" />
          <div className="product-detail-skeleton__quantity">
            <div className="store-skeleton-line store-skeleton-shimmer short" />
            <div className="product-detail-skeleton__qty-control store-skeleton-shimmer" />
          </div>
          <div className="product-detail-skeleton__actions">
            <div className="product-detail-skeleton__cta store-skeleton-shimmer" />
            <div className="product-detail-skeleton__cta store-skeleton-shimmer" />
          </div>
        </div>
      </div>

      <div className="product-detail-skeleton__section">
        <div className="store-skeleton-line store-skeleton-shimmer medium" style={{ height: 22 }} />
        <div className="product-detail-skeleton__copy store-skeleton-shimmer" />
        <div className="product-detail-skeleton__copy store-skeleton-shimmer" />
        <div className="product-detail-skeleton__copy store-skeleton-shimmer medium" />
      </div>
    </div>
  );
}
