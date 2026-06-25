import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../../../types/user";

export interface UserData {
  id: number | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  profileImage: string | null;
}


export interface UserAuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

function mapUserDataToUser(data: UserData): User {
  const name =
    [data.firstName, data.lastName].filter(Boolean).join(" ").trim() ||
    data.phone ||
    "Customer";

  return {
    id: data.id != null ? String(data.id) : "",
    email: data.email,
    name,
    phone: data.phone || undefined,
    avatar: data.profileImage || undefined,
  };
}

const initialState: UserAuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const userAuthSlice = createSlice({
  name: "userAuth",
  initialState,
  reducers: {
    setUserAuthLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setUserAuthError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    setUserCredentials(
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearUserAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    setUser(state, action: PayloadAction<UserData>) {
      const user = mapUserDataToUser(action.payload);
      state.user = user;
      state.isAuthenticated = Boolean(action.payload.id);
      state.error = null;
    },
    clearUser(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setUserAuthLoading,
  setUserAuthError,
  setUserCredentials,
  updateUser,
  clearUserAuth,
  setUser,
  clearUser,
} = userAuthSlice.actions;

export default userAuthSlice.reducer;
