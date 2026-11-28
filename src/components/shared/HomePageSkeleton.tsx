const PRODUCT_CARD_COUNT = 10;

export function HomePageSkeleton() {
  return (
    <div className="home-skeleton" aria-busy="true">
      <span className="home-skeleton__status" role="status">
        Loading homepage
      </span>

      <div className="home-skeleton__visuals" aria-hidden="true">
        <div className="home-skeleton__hero store-skeleton-shimmer" />

        <section className="section home-section">
          <div className="container">
            <SectionHeadingSkeleton />
            <div className="why-choose-grid home-skeleton__feature-grid">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={`home-feature-${index}`}
                  className="home-skeleton__feature-card"
                >
                  <span className="why-choose-icon-wrap">
                    <span className="home-skeleton__feature-icon store-skeleton-shimmer" />
                  </span>
                  <span className="home-skeleton__feature-title store-skeleton-shimmer" />
                  <span className="home-skeleton__feature-copy">
                    <span className="store-skeleton-line store-skeleton-shimmer" />
                    <span className="store-skeleton-line store-skeleton-shimmer medium" />
                  </span>
                </div>
              ))}
            </div>
            <ul className="why-choose-trust-bar">
              {Array.from({ length: 5 }, (_, index) => (
                <li
                  key={`home-trust-${index}`}
                  className="why-choose-trust-item"
                >
                  <span className="home-skeleton__trust-icon store-skeleton-shimmer" />
                  <span className="home-skeleton__trust-label store-skeleton-shimmer" />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section home-section category-section">
          <div className="container category-section__inner">
            <SectionHeadingSkeleton />
            <div className="category-grid">
              {Array.from({ length: 8 }, (_, index) => (
                <div
                  key={`home-category-${index}`}
                  className="category-card home-skeleton__category-card"
                >
                  <div className="category-card-media">
                    <div className="category-card-media-frame store-skeleton-shimmer" />
                    <span className="category-card-icon">
                      <span className="home-skeleton__category-icon store-skeleton-shimmer" />
                    </span>
                  </div>
                  <div className="category-card-content">
                    <span className="home-skeleton__category-title store-skeleton-shimmer" />
                    <span className="home-skeleton__category-copy">
                      <span className="store-skeleton-line store-skeleton-shimmer" />
                      <span className="store-skeleton-line store-skeleton-shimmer medium" />
                    </span>
                    <span className="home-skeleton__category-link store-skeleton-shimmer" />
                  </div>
                </div>
              ))}
            </div>
            <SkeletonAction />
          </div>
        </section>

        <ProductSectionSkeleton />

        <section className="section home-section quality-promise-section">
          <div className="container">
            <SectionHeadingSkeleton />
            <ul className="quality-promise-grid">
              {Array.from({ length: 5 }, (_, index) => (
                <li
                  key={`home-quality-${index}`}
                  className="quality-promise-item"
                >
                  <span className="quality-promise-icon">
                    <span className="home-skeleton__quality-icon store-skeleton-shimmer" />
                  </span>
                  <span className="home-skeleton__quality-title store-skeleton-shimmer" />
                  <span className="home-skeleton__quality-copy">
                    <span className="store-skeleton-line store-skeleton-shimmer" />
                    <span className="store-skeleton-line store-skeleton-shimmer medium" />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <ProductSectionSkeleton />
        <ProductSectionSkeleton />

        <section className="section home-section home-story-section">
          <div className="container">
            <SectionHeadingSkeleton />
            <div className="home-story-layout">
              <div className="home-story-video-frame">
                <div className="home-skeleton__story-video store-skeleton-shimmer" />
              </div>
              <div className="home-story-content">
                <div className="home-skeleton__story-copy">
                  <span className="store-skeleton-line store-skeleton-shimmer short" />
                  <span className="store-skeleton-line store-skeleton-shimmer" />
                  <span className="store-skeleton-line store-skeleton-shimmer medium" />
                </div>
                <div className="home-story-highlights">
                  {Array.from({ length: 3 }, (_, index) => (
                    <div
                      key={`home-story-${index}`}
                      className="home-story-highlight"
                    >
                      <span className="home-skeleton__story-icon store-skeleton-shimmer" />
                      <span className="home-skeleton__story-lines">
                        <span className="store-skeleton-line store-skeleton-shimmer medium" />
                        <span className="store-skeleton-line store-skeleton-shimmer" />
                      </span>
                    </div>
                  ))}
                </div>
                <span className="home-skeleton__story-action store-skeleton-shimmer" />
              </div>
            </div>
          </div>
        </section>

        <section className="section home-section product-reviews-showcase">
          <div className="container">
            <SectionHeadingSkeleton />
            <div className="product-reviews-grid">
              {Array.from({ length: 3 }, (_, index) => (
                <article
                  key={`home-review-${index}`}
                  className="product-review-card home-skeleton__review-card"
                >
                  <span className="home-skeleton__review-quote store-skeleton-shimmer" />
                  <span className="home-skeleton__review-stars">
                    {Array.from({ length: 5 }, (_, starIndex) => (
                      <span
                        key={`home-review-${index}-star-${starIndex}`}
                        className="store-skeleton-shimmer"
                      />
                    ))}
                  </span>
                  <span className="home-skeleton__review-copy">
                    <span className="store-skeleton-line store-skeleton-shimmer" />
                    <span className="store-skeleton-line store-skeleton-shimmer" />
                    <span className="store-skeleton-line store-skeleton-shimmer medium" />
                  </span>
                  <span className="home-skeleton__review-author">
                    <span className="store-skeleton-line store-skeleton-shimmer medium" />
                    <span className="store-skeleton-line store-skeleton-shimmer short" />
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section home-section blog-section">
          <div className="container">
            <SectionHeadingSkeleton />
            <div className="blog-grid">
              {Array.from({ length: 3 }, (_, index) => (
                <article
                  key={`home-blog-${index}`}
                  className="blog-card home-skeleton__blog-card"
                >
                  <div className="blog-card-media store-skeleton-shimmer" />
                  <div className="blog-card-content">
                    <div className="home-skeleton__blog-meta">
                      <span className="store-skeleton-line store-skeleton-shimmer short" />
                      <span className="store-skeleton-line store-skeleton-shimmer short" />
                    </div>
                    <span className="home-skeleton__blog-title store-skeleton-shimmer" />
                    <span className="home-skeleton__blog-copy">
                      <span className="store-skeleton-line store-skeleton-shimmer" />
                      <span className="store-skeleton-line store-skeleton-shimmer" />
                      <span className="store-skeleton-line store-skeleton-shimmer medium" />
                    </span>
                    <span className="home-skeleton__blog-link store-skeleton-shimmer" />
                  </div>
                </article>
              ))}
            </div>
            <SkeletonAction />
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHeadingSkeleton() {
  return (
    <div className="home-skeleton__heading">
      <span className="home-skeleton__eyebrow">
        <span />
        <span className="home-skeleton__eyebrow-text store-skeleton-shimmer" />
        <span />
      </span>
      <span className="home-skeleton__title store-skeleton-shimmer" />
      <span className="home-skeleton__description">
        <span className="store-skeleton-line store-skeleton-shimmer" />
        <span className="store-skeleton-line store-skeleton-shimmer medium" />
      </span>
      <span className="home-skeleton__divider">
        <span />
        <span className="store-skeleton-shimmer" />
        <span />
      </span>
    </div>
  );
}

function ProductSectionSkeleton() {
  return (
    <section className="section home-section home-product-section">
      <div className="container">
        <SectionHeadingSkeleton />
        <div className="home-product-grid">
          {Array.from({ length: PRODUCT_CARD_COUNT }, (_, index) => (
            <ProductCardSkeleton key={`home-product-${index}`} />
          ))}
        </div>
        <SkeletonAction />
      </div>
    </section>
  );
}

function ProductCardSkeleton() {
  return (
    <article className="product-card home-skeleton__product-card">
      <div className="image-container">
        <div className="home-skeleton__product-image store-skeleton-shimmer" />
        <span className="home-skeleton__product-badge store-skeleton-shimmer" />
        <span className="home-skeleton__product-action store-skeleton-shimmer" />
        <span className="home-skeleton__product-cart store-skeleton-shimmer" />
      </div>
      <div className="content">
        <span className="home-skeleton__product-category store-skeleton-shimmer" />
        <span className="home-skeleton__product-name">
          <span className="store-skeleton-line store-skeleton-shimmer" />
          <span className="store-skeleton-line store-skeleton-shimmer medium" />
        </span>
        <span className="rating home-skeleton__product-rating">
          <span className="home-skeleton__product-stars">
            {Array.from({ length: 5 }, (_, index) => (
              <span
                key={`product-star-${index}`}
                className="store-skeleton-shimmer"
              />
            ))}
          </span>
          <span className="home-skeleton__review-count store-skeleton-shimmer" />
        </span>
        <span className="price-section home-skeleton__product-price">
          <span className="prices">
            <span className="home-skeleton__current-price store-skeleton-shimmer" />
            <span className="home-skeleton__original-price store-skeleton-shimmer" />
          </span>
          <span className="home-skeleton__stock-status store-skeleton-shimmer" />
        </span>
      </div>
    </article>
  );
}

function SkeletonAction() {
  return (
    <div className="home-section__actions">
      <span className="home-skeleton__view-all store-skeleton-shimmer" />
    </div>
  );
}
