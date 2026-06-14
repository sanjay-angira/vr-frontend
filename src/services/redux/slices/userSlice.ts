import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserData {
  id: number | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pinCode: string |  null;
  profileImage: string | null;
}

interface LoginState {
  user: UserData;
}

const initialState: LoginState = {
  user: {
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    profileImage: '',
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserData>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = {
        id: null,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pinCode: '',
        profileImage: '',
      };
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer; 