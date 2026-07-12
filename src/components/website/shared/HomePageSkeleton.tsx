export function HomePageSkeleton() {
  return (
    <div className="home-skeleton" aria-busy="true" aria-live="polite">
      <div className="home-skeleton__hero store-skeleton-shimmer" />

      <div className="container home-skeleton__section">
        <div className="home-skeleton__heading">
          <div className="store-skeleton-line store-skeleton-shimmer short" />
          <div className="store-skeleton-line store-skeleton-shimmer medium" />
        </div>
        <div className="home-skeleton__category-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`home-cat-${index}`} className="home-skeleton__category-card">
              <div className="home-skeleton__category-image store-skeleton-shimmer" />
              <div className="store-skeleton-line store-skeleton-shimmer medium" />
            </div>
          ))}
        </div>
      </div>

      <div className="container home-skeleton__section">
        <div className="home-skeleton__heading">
          <div className="store-skeleton-line store-skeleton-shimmer short" />
          <div className="store-skeleton-line store-skeleton-shimmer medium" />
        </div>
        <div className="home-skeleton__product-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`home-prod-${index}`} className="store-skeleton-card">
              <div className="store-skeleton-image store-skeleton-shimmer" />
              <div className="store-skeleton-content">
                <div className="store-skeleton-line store-skeleton-shimmer short" />
                <div className="store-skeleton-line store-skeleton-shimmer" />
                <div className="store-skeleton-line store-skeleton-shimmer medium" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container home-skeleton__section">
        <div className="home-skeleton__heading">
          <div className="store-skeleton-line store-skeleton-shimmer short" />
          <div className="store-skeleton-line store-skeleton-shimmer medium" />
        </div>
        <div className="home-skeleton__banner store-skeleton-shimmer" />
      </div>
    </div>
  );
}
