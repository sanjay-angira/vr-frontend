/** Cart line-item skeleton — shown while the initial cart fetch runs. */

const ROWS = 3;

export function CartSkeleton() {
  return (
    <div
      className="commerce-list cart-list cart-skeleton"
      aria-busy="true"
      aria-label="Loading your cart"
    >
      {Array.from({ length: ROWS }, (_, index) => (
        <article
          key={index}
          className="commerce-line cart-line cart-skeleton-line"
        >
          <div className="cart-skeleton-thumb" aria-hidden />
          <div className="cart-skeleton-body">
            <div className="cart-skeleton-top">
              <div className="cart-skeleton-copy">
                <span className="cart-skeleton-bar cart-skeleton-bar--title" />
                <span className="cart-skeleton-bar cart-skeleton-bar--meta" />
              </div>
              <span className="cart-skeleton-bar cart-skeleton-bar--price" />
            </div>
            <div className="cart-skeleton-actions">
              <span className="cart-skeleton-bar cart-skeleton-bar--qty" />
              <span className="cart-skeleton-bar cart-skeleton-bar--unit" />
              <span className="cart-skeleton-bar cart-skeleton-bar--remove" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function CartClearSkeleton() {
  return (
    <span
      className="cart-skeleton-bar cart-skeleton-bar--clear"
      aria-hidden
    />
  );
}
