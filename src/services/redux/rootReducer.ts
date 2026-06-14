import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import modalReducer from './slices/modalSlice';
import cartReducer from './slices/cartSlice';

const rootReducer = combineReducers({
  user: userReducer,
  modal: modalReducer,
  cart: cartReducer,
});

export default rootReducer; 