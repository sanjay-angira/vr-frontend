import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  toggleForm: boolean;
  toggleModal: boolean;
  cartDrawerOpen: boolean;
}

const initialState: ModalState = {
  toggleForm: false,
  toggleModal: false,
  cartDrawerOpen: false,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    toggleForm(state) {
      state.toggleForm = !state.toggleForm;
    },
    toggleModal(state) {
      state.toggleModal = !state.toggleModal;
    },
    toggleCartDrawer(state) {
      state.cartDrawerOpen = !state.cartDrawerOpen;
    },
    setCartDrawerOpen(state, action: PayloadAction<boolean>) {
      state.cartDrawerOpen = action.payload;
    },
  },
});

export const {
  toggleForm,
  toggleModal,
  toggleCartDrawer,
  setCartDrawerOpen,
} = modalSlice.actions;

export default modalSlice.reducer; 