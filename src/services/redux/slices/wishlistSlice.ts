import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as wishlistApi from "@/services/website/wishlistService";
import type { WishlistItem } from "@/services/website/wishlistService";

interface WishlistState {
  items: WishlistItem[];
  variationIds: number[];
  count: number;
  loading: boolean;
  mutating: boolean;
  hydrated: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  variationIds: [],
  count: 0,
  loading: false,
  mutating: false,
  hydrated: false,
  error: null,
};

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: string }).message || fallback);
  }
  return fallback;
}

function applyIds(state: WishlistState, ids: number[]) {
  const unique = [...new Set(ids.filter((id) => Number.isFinite(id) && id > 0))];
  state.variationIds = unique;
  state.count = unique.length;
}

export const fetchWishlistIds = createAsyncThunk(
  "wishlist/fetchIds",
  async (_, { rejectWithValue }) => {
    try {
      return await wishlistApi.listWishlistVariationIds();
    } catch (error: unknown) {
      return rejectWithValue(errorMessage(error, "Failed to fetch wishlist"));
    }
  },
);

export const fetchWishlistItems = createAsyncThunk(
  "wishlist/fetchItems",
  async (_, { rejectWithValue }) => {
    try {
      return await wishlistApi.listWishlistItems();
    } catch (error: unknown) {
      return rejectWithValue(errorMessage(error, "Failed to fetch wishlist"));
    }
  },
);

export const toggleWishlistItem = createAsyncThunk(
  "wishlist/toggle",
  async (variationId: number, { rejectWithValue }) => {
    try {
      return await wishlistApi.toggleWishlist(variationId);
    } catch (error: unknown) {
      return rejectWithValue(errorMessage(error, "Failed to update wishlist"));
    }
  },
);

export const removeWishlistEntry = createAsyncThunk(
  "wishlist/remove",
  async (
    payload: { id: number; variationId: number },
    { rejectWithValue },
  ) => {
    try {
      await wishlistApi.removeWishlistItem(payload.id);
      return payload;
    } catch (error: unknown) {
      return rejectWithValue(
        errorMessage(error, "Failed to remove from wishlist"),
      );
    }
  },
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist(state) {
      state.items = [];
      state.variationIds = [];
      state.count = 0;
      state.hydrated = false;
      state.error = null;
      state.loading = false;
      state.mutating = false;
    },
    setWishlistIds(state, action: PayloadAction<number[]>) {
      applyIds(state, action.payload);
      state.hydrated = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWishlistIds.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchWishlistIds.fulfilled, (state, action) => {
      state.loading = false;
      state.hydrated = true;
      applyIds(state, action.payload);
    });
    builder.addCase(fetchWishlistIds.rejected, (state, action) => {
      state.loading = false;
      state.hydrated = true;
      state.error = action.payload as string;
    });

    builder.addCase(fetchWishlistItems.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchWishlistItems.fulfilled, (state, action) => {
      state.loading = false;
      state.hydrated = true;
      state.items = action.payload;
      applyIds(
        state,
        action.payload.map((item) => item.variationId),
      );
    });
    builder.addCase(fetchWishlistItems.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(toggleWishlistItem.pending, (state) => {
      state.mutating = true;
      state.error = null;
    });
    builder.addCase(toggleWishlistItem.fulfilled, (state, action) => {
      state.mutating = false;
      const { wished, variationId } = action.payload;
      if (wished) {
        if (!state.variationIds.includes(variationId)) {
          state.variationIds.push(variationId);
        }
      } else {
        state.variationIds = state.variationIds.filter(
          (id) => id !== variationId,
        );
        state.items = state.items.filter(
          (item) => item.variationId !== variationId,
        );
      }
      state.count = state.variationIds.length;
      state.hydrated = true;
    });
    builder.addCase(toggleWishlistItem.rejected, (state, action) => {
      state.mutating = false;
      state.error = action.payload as string;
    });

    builder.addCase(removeWishlistEntry.pending, (state) => {
      state.mutating = true;
      state.error = null;
    });
    builder.addCase(removeWishlistEntry.fulfilled, (state, action) => {
      state.mutating = false;
      const { id, variationId } = action.payload;
      state.items = state.items.filter((item) => item.id !== id);
      state.variationIds = state.variationIds.filter(
        (vid) => vid !== variationId,
      );
      state.count = state.variationIds.length;
    });
    builder.addCase(removeWishlistEntry.rejected, (state, action) => {
      state.mutating = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearWishlist, setWishlistIds } = wishlistSlice.actions;
export default wishlistSlice.reducer;
