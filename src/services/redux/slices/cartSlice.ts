import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as cartApi from '@/services/api/cartService';

export interface CartItemData {
  id: number;
  cartId: number;
  variationId: number;
  quantity: number;
  priceAtTime: number;
  attributesSnapshot?: Record<string, any>;
  subtotal?: number;
}

interface CartState {
  items: CartItemData[];
  total: number;
  count: number;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  total: 0,
  count: 0,
  loading: false,
  error: null,
};

// Async thunks for API calls

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const data = await cartApi.getCart();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch cart');
    }
  }
);

export const addItemToCart = createAsyncThunk(
  'cart/addItem',
  async (
    { variationId, quantity }: { variationId: number; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      const data = await cartApi.addToCart(variationId, quantity);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add item to cart');
    }
  }
);

export const updateItemQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async (
    { cartItemId, quantity }: { cartItemId: number; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      const data = await cartApi.updateCartItem(cartItemId, quantity);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update cart item');
    }
  }
);

export const removeItemFromCart = createAsyncThunk(
  'cart/removeItem',
  async (cartItemId: number, { rejectWithValue }) => {
    try {
      const data = await cartApi.removeFromCart(cartItemId);
      return { cartItemId, ...data };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove item from cart');
    }
  }
);

export const clearCartAction = createAsyncThunk(
  'cart/clear',
  async (_, { rejectWithValue }) => {
    try {
      const data = await cartApi.clearCart();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to clear cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Synchronous actions
    setCartItems(state, action: PayloadAction<CartItemData[]>) {
      state.items = action.payload;
      state.count = action.payload.length; // Show number of products, not total quantity
      state.total = action.payload.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    },
    addItem(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => String(item.variationId) === id);
      
      if (existingItem) {
        // Update existing item's quantity (don't add to old count)
        existingItem.quantity = quantity;
      } else {
        // Add new item (this won't happen often with API call, but for completeness)
        state.items.push({
          id: parseInt(id),
          cartId: 0,
          variationId: parseInt(id),
          quantity,
          priceAtTime: 0,
        });
      }
      
      // Recalculate count (number of products, not quantity)
      state.count = state.items.length;
    },
    clearError(state) {
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder.addCase(fetchCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload.items || [];
      state.total = action.payload.total || 0;
      state.count = state.items.length; // Show number of products
    });
    builder.addCase(fetchCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add item
    builder.addCase(addItemToCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addItemToCart.fulfilled, (state, action) => {
      state.loading = false;
      // Optionally fetch cart again to get updated state
      // Or update items manually if response contains the full cart
      if (action.payload.items) {
        state.items = action.payload.items;
        state.total = action.payload.total || 0;
        state.count = state.items.length; // Show number of products
      }
    });
    builder.addCase(addItemToCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update quantity
    builder.addCase(updateItemQuantity.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateItemQuantity.fulfilled, (state, action) => {
      state.loading = false;
      // Update item in state
      const { cartItemId, quantity } = action.payload;
      const item = state.items.find((i) => i.id === cartItemId);
      if (item) {
        item.quantity = quantity;
        state.count = state.items.length; // Show number of products
        state.total = state.items.reduce((sum, i) => sum + (i.subtotal || 0), 0);
      }
    });
    builder.addCase(updateItemQuantity.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Remove item
    builder.addCase(removeItemFromCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(removeItemFromCart.fulfilled, (state, action) => {
      state.loading = false;
      const cartItemId = action.payload.cartItemId;
      state.items = state.items.filter((item) => item.id !== cartItemId);
      state.count = state.items.length; // Show number of products
      state.total = state.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    });
    builder.addCase(removeItemFromCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Clear cart
    builder.addCase(clearCartAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(clearCartAction.fulfilled, (state) => {
      state.loading = false;
      state.items = [];
      state.count = 0;
      state.total = 0;
    });
    builder.addCase(clearCartAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setCartItems, addItem, clearError, setLoading } = cartSlice.actions;
export default cartSlice.reducer;

