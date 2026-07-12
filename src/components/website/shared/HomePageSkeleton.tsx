export function HomePageSkeleton() {
  return (
    <div className="home-skeleton" aria-busy="true" aria-live="polite">
      <div className="home-skeleton__hero store-skeleton-shimmer" />

      <section className="section category-section">
        <div className="container">
          <div className="home-skeleton__heading">
            <div className="store-skeleton-line store-skeleton-shimmer short" />
            <div className="store-skeleton-line store-skeleton-shimmer medium" />
          </div>
          <div className="category-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`home-cat-${index}`}
                className="home-skeleton__category-card"
              >
                <div className="home-skeleton__category-media store-skeleton-shimmer" />
                <div className="home-skeleton__category-body">
                  <div className="store-skeleton-line store-skeleton-shimmer medium" />
                  <div className="store-skeleton-line store-skeleton-shimmer" />
                  <div className="store-skeleton-line store-skeleton-shimmer short" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="home-skeleton__heading">
            <div className="store-skeleton-line store-skeleton-shimmer short" />
            <div className="store-skeleton-line store-skeleton-shimmer medium" />
          </div>
          <div className="home-skeleton__product-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`home-prod-${index}`} className="home-skeleton__product-card">
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
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="home-skeleton__heading">
            <div className="store-skeleton-line store-skeleton-shimmer short" />
            <div className="store-skeleton-line store-skeleton-shimmer medium" />
          </div>
          <div className="home-skeleton__banner store-skeleton-shimmer" />
        </div>
      </section>
    </div>
  );
}
