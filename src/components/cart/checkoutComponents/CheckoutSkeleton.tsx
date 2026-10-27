const ADVANTAGE_ROWS = Array.from({ length: 3 });

export function CheckoutSkeleton() {
  return (
    <div className="checkout-accordion checkout-skeleton" aria-busy="true" aria-label="Loading checkout">
      <section className="checkout-step checkout-step--open checkout-skeleton-step">
        <div className="checkout-step-head">
          <span className="checkout-skeleton-number" />
          <span className="order-summary-skel checkout-skeleton-heading" />
        </div>
        <div className="checkout-login-panel checkout-skeleton-login">
          <div className="checkout-skeleton-login-form">
            <span className="order-summary-skel checkout-skeleton-copy" />
            <span className="order-summary-skel checkout-skeleton-input" />
            <div className="checkout-skeleton-login-actions">
              <span className="order-summary-skel checkout-skeleton-button" />
              <span className="order-summary-skel checkout-skeleton-button checkout-skeleton-button--secondary" />
            </div>
          </div>
          <aside className="checkout-skeleton-advantages">
            <span className="order-summary-skel checkout-skeleton-advantage-heading" />
            {ADVANTAGE_ROWS.map((_, index) => (
              <div className="checkout-skeleton-advantage" key={index}>
                <span className="order-summary-skel checkout-skeleton-advantage-icon" />
                <span className="order-summary-skel checkout-skeleton-advantage-copy" />
              </div>
            ))}
            <span className="order-summary-skel checkout-skeleton-advantage-footnote" />
          </aside>
        </div>
      </section>

      {[2, 3].map((step) => (
        <section
          className="checkout-step checkout-step--locked checkout-skeleton-step checkout-skeleton-locked"
          key={step}
        >
          <div className="checkout-step-head">
            <span className="checkout-skeleton-number" />
            <span className="order-summary-skel checkout-skeleton-heading" />
          </div>
          <span className="order-summary-skel checkout-skeleton-locked-copy" />
        </section>
      ))}
    </div>
  );
}
