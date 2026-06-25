import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Admin } from "@/types/user";

export interface AdminAuthState {
  admin: Admin | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminAuthState = {
  admin: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};


const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    setAdminAuthLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setAdminAuthError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    setAdminCredentials(
      state,
      action: PayloadAction<{ admin: Admin; accessToken: string }>
    ) {
      state.admin = action.payload.admin;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    updateAdmin(state, action: PayloadAction<Partial<Admin>>) {
      if (state.admin) {
        state.admin = { ...state.admin, ...action.payload };
      }
    },
    clearAdminAuth(state) {
      state.admin = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setAdminAuthLoading,
  setAdminAuthError,
  setAdminCredentials,
  updateAdmin,
  clearAdminAuth,
} = adminAuthSlice.actions;

export default adminAuthSlice.reducer;
