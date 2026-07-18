import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import * as cartApi from "@/services/website/cartService";
import type { CartItemData } from "@/services/website/cartService";

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

function applyCartData(state: CartState, data: { items?: CartItemData[]; total?: number }) {
  state.items = data.items || [];
  state.total = Number(data.total) || 0;
  state.count = state.items.length;
}

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: string }).message || fallback);
  }
  return fallback;
}

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      return await cartApi.getCart();
    } catch (error: unknown) {
      return rejectWithValue(errorMessage(error, "Failed to fetch cart"));
    }
  }
);

export const addItemToCart = createAsyncThunk(
  "cart/addItem",
  async (
    { variationId, quantity }: { variationId: number; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      await cartApi.addToCart(variationId, quantity);
      return await cartApi.getCart();
    } catch (error: unknown) {
      return rejectWithValue(errorMessage(error, "Failed to add item to cart"));
    }
  }
);

export const updateItemQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async (
    { cartItemId, quantity }: { cartItemId: number; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      await cartApi.updateCartItem(cartItemId, quantity);
      return await cartApi.getCart();
    } catch (error: unknown) {
      return rejectWithValue(errorMessage(error, "Failed to update cart item"));
    }
  }
);

export const removeItemFromCart = createAsyncThunk(
  "cart/removeItem",
  async (cartItemId: number, { rejectWithValue }) => {
    try {
      await cartApi.removeFromCart(cartItemId);
      return await cartApi.getCart();
    } catch (error: unknown) {
      return rejectWithValue(errorMessage(error, "Failed to remove item from cart"));
    }
  }
);

export const clearCartAction = createAsyncThunk(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try {
      await cartApi.clearCart();
      return { items: [], total: 0 } as cartApi.CartData;
    } catch (error: unknown) {
      return rejectWithValue(errorMessage(error, "Failed to clear cart"));
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems(state, action: PayloadAction<CartItemData[]>) {
      applyCartData(state, {
        items: action.payload,
        total: action.payload.reduce(
          (sum, item) => sum + Number(item.subtotal || item.quantity * Number(item.priceAtTime || 0)),
          0
        ),
      });
    },
    addItem(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find(
        (item) => String(item.variationId) === id
      );

      if (existingItem) {
        existingItem.quantity = quantity;
        existingItem.subtotal =
          quantity * Number(existingItem.priceAtTime || 0);
      } else {
        state.items.push({
          id: Number(id),
          cartId: 0,
          variationId: Number(id),
          quantity,
          priceAtTime: 0,
          subtotal: 0,
        });
      }

      state.count = state.items.length;
      state.total = state.items.reduce(
        (sum, item) =>
          sum + Number(item.subtotal || item.quantity * Number(item.priceAtTime || 0)),
        0
      );
    },
    clearError(state) {
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.loading = false;
      applyCartData(state, action.payload);
    });
    builder.addCase(fetchCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(addItemToCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addItemToCart.fulfilled, (state, action) => {
      state.loading = false;
      applyCartData(state, action.payload);
    });
    builder.addCase(addItemToCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(updateItemQuantity.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateItemQuantity.fulfilled, (state, action) => {
      state.loading = false;
      applyCartData(state, action.payload);
    });
    builder.addCase(updateItemQuantity.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(removeItemFromCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(removeItemFromCart.fulfilled, (state, action) => {
      state.loading = false;
      applyCartData(state, action.payload);
    });
    builder.addCase(removeItemFromCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(clearCartAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(clearCartAction.fulfilled, (state, action) => {
      state.loading = false;
      applyCartData(state, action.payload);
    });
    builder.addCase(clearCartAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setCartItems, addItem, clearError, setLoading } =
  cartSlice.actions;
export default cartSlice.reducer;

export {
  fetchCart as fetchWebsiteCart,
  addItemToCart as addWebsiteCartItem,
  updateItemQuantity as updateWebsiteCartItem,
  removeItemFromCart as removeWebsiteCartItem,
  clearCartAction as clearWebsiteCart,
  setCartItems as setWebsiteCartItems,
  addItem as syncWebsiteCartItem,
  clearError as clearWebsiteCartError,
};
