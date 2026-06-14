'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/services/redux/store';
import { setCartDrawerOpen } from '@/services/redux/slices/modalSlice';
import { removeItemFromCart, updateItemQuantity } from '@/services/redux/slices/cartSlice';
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowRight, ShoppingBag } from 'lucide-react';
import { AppDispatch } from '@/services/redux/store';

export default function CartDrawer() {
  const dispatch = useDispatch<AppDispatch>();
  const cartDrawerOpen = useSelector((state: RootState) => state.modal.cartDrawerOpen);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartTotal = useSelector((state: RootState) => state.cart.total);
  const loading = useSelector((state: RootState) => state.cart.loading);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  const handleClose = () => {
    dispatch(setCartDrawerOpen(false));
  };

  const handleRemoveItem = (cartItemId: number) => {
    dispatch(removeItemFromCart(cartItemId));
  };

  const handleUpdateQuantity = (cartItemId: number, newQuantity: number) => {
    if (newQuantity > 0) {
      dispatch(updateItemQuantity({ cartItemId, quantity: newQuantity }));
    }
  };

  return (
    <>
      {/* Overlay */}
      {cartDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300"
          onClick={handleClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl transition-transform duration-300 ease-in-out z-[101] flex flex-col ${cartDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          } sm:rounded-l-2xl overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between !px-6 !py-5 border-b border-gray-100 bg-white/80 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
              <ShoppingBag size={20} className="stroke-[2.5px]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight leading-none">Your Cart</h2>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            title="Close cart"
          >
            <X size={20} className="stroke-[2.5px]" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto !py-2 bg-gray-50 flex flex-col scrollbar-thin scrollbar-thumb-gray-200">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-green-600"></div>
              <p className="text-sm font-medium">Loading cart...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 text-sm max-w-[200px]">
                Looks like you haven't added anything to your cart yet.
              </p>
              <button
                onClick={handleClose}
                className="!mt-8 !px-6 !py-2.5 bg-gray-900 text-white text-sm font-semibold !rounded-xl hover:bg-gray-800 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              {cartItems.map((item: any) => {
                const imageUrl = item.productType === 'simple'
                  ? (item.variant?.product?.images?.[0]?.url || item.image)
                  : (item.variant?.images?.[0]?.url || item.image);

                return (
                  <div
                    key={item.id}
                    style={{ margin: '0 10px 10px 10px' }}
                    className="group relative bg-white !rounded-2xl !p-2 sm:p-2 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] border border-gray-100 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] hover:border-green-200 transition-all duration-300 mx-4 sm:mx-6 overflow-hidden"
                  >
                    {/* Subtle hover accent line */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="flex gap-4 sm:gap-5">
                      {/* Product Image */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-100 shadow-inner relative">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.productName || 'Product'}
                            className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <span className="text-gray-400 font-bold text-2xl uppercase tracking-wider">
                            {item.productName?.charAt(0) || 'P'}
                          </span>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-gray-900 text-sm !rounded-2xl sm:text-base leading-snug line-clamp-2 pr-6" title={item.productName || 'Unknown Product'}>
                              {item.productName || 'Unknown Product'}
                            </h3>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="absolute top-4 right-4 text-gray-300 hover:text-red-500 bg-white hover:bg-red-50 !p-1.5 !rounded-full transition-colors shadow-sm border border-transparent hover:border-red-100"
                              title="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {/* Product Type & Variant Badges */}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={`inline-flex items-center !px-2 !py-0.5 text-[10px] uppercase tracking-widest font-bold rounded-full border ${item.productType === 'variable'
                              ? 'bg-purple-50 text-purple-700 border-purple-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              }`}>
                              {item.productType === 'variable' ? 'Variant' : 'Simple'}
                            </span>
                            {item.variantName && (
                              <span className="text-xs text-gray-500 font-medium line-clamp-1 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                {item.variantName}
                              </span>
                            )}
                          </div>

                          {/* Attributes if available */}
                          {item.attributesSnapshot && Object.keys(item.attributesSnapshot).length > 0 && (
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              {Object.entries(item.attributesSnapshot).map(([key, value]) => (
                                <span key={key} className="bg-gray-50 text-gray-500 px-2 py-1 rounded-md text-[10px] font-medium border border-gray-100">
                                  <span className="text-gray-400 mr-1">{key}:</span>
                                  <span className="text-gray-700">{String(value)}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Price and Quantity aligned at bottom */}
                        <div className="flex items-end justify-between mt-4">
                          <div className="flex flex-col">
                            <span className="font-black text-gray-900 text-lg leading-none tracking-tight">
                              Rs. {(item.subtotal || 0).toFixed(2)}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">
                                Rs. {item.priceAtTime} each
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls - Pill Shape */}
                          <div className="flex items-center bg-white !rounded-2xl p-1 border border-gray-200 shadow-sm">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full disabled:opacity-30 disabled:hover:bg-gray-50 transition-all"
                            >
                              <Minus size={14} className="stroke-[2.5px]" />
                            </button>
                            <span className="w-8 text-center font-bold text-gray-900 text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-all"
                            >
                              <Plus size={14} className="stroke-[2.5px]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Total and Checkout */}
        {cartItems.length > 0 && (
          <div className="bg-white border-t border-gray-200 !p-4 sm:p-6 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] z-10">
            {/* Total */}
            <div className="flex flex-col mb-5">
              <div className="flex justify-between items-end mb-1">
                <span className="text-gray-500 font-semibold text-sm">Subtotal</span>
                <span className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                  Rs. {(cartTotal || 0).toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-400 text-right">
                Taxes and shipping calculated at checkout
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                className="group relative w-full flex justify-center items-center gap-2 !px-6 !py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all duration-300 overflow-hidden shadow-lg shadow-gray-900/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" />
                <span className="relative z-10 flex items-center gap-2">
                  Checkout Now
                  <ArrowRight size={18} className="stroke-[2.5px] group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <button
                onClick={handleClose}
                className="w-full py-2.5 text-sm text-gray-500 font-bold hover:text-gray-900 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

