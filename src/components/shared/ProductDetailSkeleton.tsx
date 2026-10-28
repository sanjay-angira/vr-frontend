export function ProductDetailSkeleton() {
  return (
    <div
      className="container product-page-shell product-detail-skeleton"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading product"
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
          <div className="product-detail-skeleton__meta-row">
            <div className="product-detail-skeleton__chips">
              <div className="product-detail-skeleton__chip store-skeleton-shimmer" />
              <div className="product-detail-skeleton__chip store-skeleton-shimmer" />
            </div>
            <div className="product-detail-skeleton__share store-skeleton-shimmer" />
          </div>

          <div className="product-detail-skeleton__title">
            <div className="store-skeleton-shimmer" />
            <div className="store-skeleton-shimmer" />
          </div>
          <div className="product-detail-skeleton__rating">
            <div className="store-skeleton-shimmer" />
            <div className="store-skeleton-shimmer" />
            <div className="store-skeleton-shimmer" />
          </div>
          <div className="product-detail-skeleton__subtitle">
            <div className="store-skeleton-shimmer" />
            <div className="store-skeleton-shimmer" />
          </div>
          <div className="product-detail-skeleton__price-block">
            <div className="product-detail-skeleton__price-row">
              <div className="product-detail-skeleton__price store-skeleton-shimmer" />
              <div className="product-detail-skeleton__price-original store-skeleton-shimmer" />
              <div className="product-detail-skeleton__price-badge store-skeleton-shimmer" />
            </div>
            <div className="product-detail-skeleton__stock store-skeleton-shimmer" />
          </div>

          <div className="product-detail-skeleton__offers" aria-hidden>
            <div className="product-detail-skeleton__offers-head">
              <div className="product-detail-skeleton__offers-heading store-skeleton-shimmer" />
            </div>
            <div className="product-detail-skeleton__offers-track">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`offer-card-${index}`}
                  className="product-detail-skeleton__offer-card"
                >
                  <div className="product-detail-skeleton__offer-icon store-skeleton-shimmer" />
                  <div className="product-detail-skeleton__offer-name store-skeleton-shimmer" />
                  <div className="product-detail-skeleton__offer-discount store-skeleton-shimmer" />
                  <div className="product-detail-skeleton__offer-hint store-skeleton-shimmer" />
                  <div className="product-detail-skeleton__offer-action store-skeleton-shimmer" />
                </div>
              ))}
            </div>
            <div className="product-detail-skeleton__offers-coupon store-skeleton-shimmer" />
          </div>

          <div className="product-detail-skeleton__delivery">
            <div className="product-detail-skeleton__delivery-heading store-skeleton-shimmer" />
            <div className="product-detail-skeleton__delivery-form">
              <div className="product-detail-skeleton__delivery-input store-skeleton-shimmer" />
              <div className="product-detail-skeleton__delivery-button store-skeleton-shimmer" />
              <div className="product-detail-skeleton__delivery-button product-detail-skeleton__delivery-button--location store-skeleton-shimmer" />
            </div>
          </div>

          <div className="product-detail-skeleton__options">
            <div className="product-detail-skeleton__options-heading store-skeleton-shimmer" />
            <div className="product-detail-skeleton__option-label store-skeleton-shimmer" />
            <div className="product-detail-skeleton__option-values">
              <div className="product-detail-skeleton__option-value store-skeleton-shimmer" />
              <div className="product-detail-skeleton__option-value store-skeleton-shimmer" />
              <div className="product-detail-skeleton__option-value store-skeleton-shimmer" />
            </div>
          </div>

          <div className="product-detail-skeleton__actions">
            <div className="product-detail-skeleton__qty-control store-skeleton-shimmer" />
            <div className="product-detail-skeleton__cta-bar">
              <div className="product-detail-skeleton__cta store-skeleton-shimmer" />
              <div className="product-detail-skeleton__cta store-skeleton-shimmer" />
            </div>
          </div>

          <div className="product-detail-skeleton__coupon-banner store-skeleton-shimmer" />

          <div className="product-detail-skeleton__trust">
            <div className="product-detail-skeleton__trust-item store-skeleton-shimmer" />
            <div className="product-detail-skeleton__trust-item store-skeleton-shimmer" />
            <div className="product-detail-skeleton__trust-item store-skeleton-shimmer" />
          </div>

          <div className="product-detail-skeleton__variant-details">
            <div className="product-detail-skeleton__variant-heading store-skeleton-shimmer" />
            <div className="product-detail-skeleton__copy store-skeleton-shimmer" />
            <div className="product-detail-skeleton__copy product-detail-skeleton__copy--short store-skeleton-shimmer" />
          </div>
        </div>
      </div>

      <div className="product-detail-skeleton__section">
        <div className="product-detail-skeleton__section-heading store-skeleton-shimmer" />
        <div className="product-detail-skeleton__copy store-skeleton-shimmer" />
        <div className="product-detail-skeleton__copy store-skeleton-shimmer" />
        <div className="product-detail-skeleton__copy product-detail-skeleton__copy--short store-skeleton-shimmer" />
      </div>

      <div className="product-detail-skeleton__section">
        <div className="product-detail-skeleton__section-heading store-skeleton-shimmer" />
        <div className="product-detail-skeleton__faq-row store-skeleton-shimmer" />
        <div className="product-detail-skeleton__faq-row store-skeleton-shimmer" />
        <div className="product-detail-skeleton__faq-row store-skeleton-shimmer" />
      </div>

      <div className="product-detail-skeleton__section">
        <div className="product-detail-skeleton__section-heading store-skeleton-shimmer" />
        <div className="product-detail-skeleton__review-summary store-skeleton-shimmer" />
        <div className="product-detail-skeleton__review-card store-skeleton-shimmer" />
        <div className="product-detail-skeleton__review-card store-skeleton-shimmer" />
      </div>
    </div>
  );
}
