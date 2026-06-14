// src/components/CartExample.tsx

/**
 * CART IMPLEMENTATION EXAMPLE
 * 
 * This file shows how to implement cart functionality in your components.
 * Copy and adapt these patterns to your actual product and cart components.
 */

'use client';

import { useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { getSessionInfo } from '@/utils/sessionIdUtil';

// ============================================================================
// EXAMPLE 1: Fetch Cart on Component Mount
// ============================================================================

export function CartLoader() {
  const { fetchCart, loading, error } = useCart();

  useEffect(() => {
    // Fetch cart when component mounts
    fetchCart();
  }, []);

  if (loading) return <div>Loading cart...</div>;
  if (error) return <div>Error: {error}</div>;

  return null;
}

// ============================================================================
// EXAMPLE 2: Add to Cart Button (for Product Component)
// ============================================================================

interface AddToCartButtonProps {
  variationId: number;
  quantity: number;
  productName: string;
}

export function AddToCartButton({
  variationId,
  quantity,
  productName,
}: AddToCartButtonProps) {
  const { addItem, loading, error } = useCart();

  const handleAddToCart = async () => {
    try {
      await addItem(variationId, quantity);
      const { isGuest } = getSessionInfo();
      alert(
        `${productName} added to cart! ${isGuest ? '(Guest checkout)' : ''}`
      );
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  return (
    <div>
      <button
        onClick={handleAddToCart}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Adding...' : 'Add to Cart'}
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Cart Summary (Header/Mini Cart)
// ============================================================================

export function CartSummary() {
  const { count, total, items } = useCart();

  return (
    <div className="flex items-center gap-4">
      <div>
        <span className="text-xl font-bold">{count}</span>
        <span className="ml-2 text-gray-600">items</span>
      </div>
      <div>
        <span className="text-lg font-semibold">${total.toFixed(2)}</span>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Cart Items List (Cart Page)
// ============================================================================

export function CartItemsList() {
  const { items, loading, removeItem, updateQuantity } = useCart();

  if (loading) return <div>Loading...</div>;
  if (items.length === 0) return <div>Your cart is empty</div>;

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between p-4 border rounded"
        >
          <div>
            <p className="font-semibold">Variation ID: {item.variationId}</p>
            <p className="text-gray-600">Qty: {item.quantity}</p>
            <p className="text-lg font-bold">${item.subtotal?.toFixed(2)}</p>
          </div>

          <div className="flex gap-2">
            {/* Update Quantity */}
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => {
                const newQty = parseInt(e.target.value);
                updateQuantity(item.id, newQty);
              }}
              className="w-16 px-2 py-1 border rounded"
            />

            {/* Remove Button */}
            <button
              onClick={() => removeItem(item.id)}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Checkout (with Guest vs Authenticated Logic)
// ============================================================================

export function CheckoutButton() {
  const { items } = useCart();
  const { isGuest, sessionId } = getSessionInfo();

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Cart is empty!');
      return;
    }

    if (isGuest) {
      alert(`Guest checkout with session: ${sessionId}`);
      // Redirect to guest checkout page with sessionId
      // window.location.href = `/checkout?sessionId=${sessionId}`;
    } else {
      alert('Authenticated checkout');
      // Redirect to authenticated checkout
      // window.location.href = '/checkout';
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={items.length === 0}
      className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700 disabled:bg-gray-400"
    >
      Proceed to Checkout
    </button>
  );
}

// ============================================================================
// EXAMPLE 6: Session Info Display (for debugging)
// ============================================================================

export function SessionInfoDisplay() {
  const { isGuest, sessionId } = getSessionInfo();

  return (
    <div className="p-4 bg-gray-100 rounded text-sm">
      <p>
        <strong>User Type:</strong> {isGuest ? 'Guest' : 'Authenticated'}
      </p>
      {isGuest && (
        <p>
          <strong>Session ID:</strong> {sessionId}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// INTEGRATION GUIDE
// ============================================================================

/**
 * HOW TO INTEGRATE INTO YOUR COMPONENTS:
 *
 * 1. PRODUCT DETAIL PAGE:
 *    - Import AddToCartButton and use it
 *    - Pass variationId, quantity, productName
 *
 * 2. HEADER/NAVIGATION:
 *    - Import CartSummary and display it
 *    - Shows count and total
 *
 * 3. CART PAGE:
 *    - Import CartLoader (wraps page) to fetch cart on mount
 *    - Import CartItemsList to display items
 *    - Import CheckoutButton for checkout flow
 *
 * 4. INITIALIZE CART:
 *    - Call fetchCart() when app loads (use effect in root layout)
 *    - Cart will be synced with backend
 *    - SessionId is automatically managed for guests
 *
 * EXAMPLE INTEGRATION IN APP LAYOUT:
 *
 *   import { useEffect } from 'react';
 *   import { useCart } from '@/hooks/useCart';
 *
 *   export default function RootLayout({ children }) {
 *     const { fetchCart } = useCart();
 *
 *     useEffect(() => {
 *       fetchCart(); // Sync cart on app load
 *     }, []);
 *
 *     return (
 *       <html>
 *         <body>{children}</body>
 *       </html>
 *     );
 *   }
 *
 * FOR GUEST USERS:
 * - Session ID is automatically created and stored in localStorage
 * - No login required to use cart
 * - Cart persists across browser sessions (using sessionId)
 *
 * FOR AUTHENTICATED USERS:
 * - Use userId from auth context
 * - Session ID is not used
 * - Cart synced via userId
 */
