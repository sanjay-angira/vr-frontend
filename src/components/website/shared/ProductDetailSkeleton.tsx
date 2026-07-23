export function ProductDetailSkeleton() {
  return (
    <div
      className="container product-page-shell product-detail-skeleton"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="product-detail-skeleton__breadcrumbs">
        <div className="store-skeleton-line store-skeleton-shimmer" />
        <div className="store-skeleton-line store-skeleton-shimmer short" />
        <div className="store-skeleton-line store-skeleton-shimmer medium" />
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

          <div className="product-detail-skeleton__title store-skeleton-shimmer" />
          <div className="product-detail-skeleton__rating store-skeleton-shimmer" />
          <div className="product-detail-skeleton__subtitle store-skeleton-shimmer" />
          <div className="product-detail-skeleton__price-block store-skeleton-shimmer" />
          <div className="product-detail-skeleton__options store-skeleton-shimmer" />

          <div className="product-detail-skeleton__quantity">
            <div className="product-detail-skeleton__qty-label store-skeleton-shimmer" />
            <div className="product-detail-skeleton__qty-control store-skeleton-shimmer" />
          </div>

          <div className="product-detail-skeleton__actions">
            <div className="product-detail-skeleton__cta store-skeleton-shimmer" />
            <div className="product-detail-skeleton__cta store-skeleton-shimmer" />
          </div>

          <div className="product-detail-skeleton__trust">
            <div className="product-detail-skeleton__trust-item store-skeleton-shimmer" />
            <div className="product-detail-skeleton__trust-item store-skeleton-shimmer" />
            <div className="product-detail-skeleton__trust-item store-skeleton-shimmer" />
          </div>
        </div>
      </div>

      <div className="product-detail-skeleton__section">
        <div className="product-detail-skeleton__section-heading store-skeleton-shimmer" />
        <div className="product-detail-skeleton__copy store-skeleton-shimmer" />
        <div className="product-detail-skeleton__copy store-skeleton-shimmer" />
        <div className="product-detail-skeleton__copy product-detail-skeleton__copy--short store-skeleton-shimmer" />
      </div>
    </div>
  );
}
