import { configureStore } from "@reduxjs/toolkit";
import userAuthReducer from "@/services/redux/slices/userAuthSlice";
import websiteCartReducer from "@/services/redux/slices/cartSlice";
import cartReducer from "@/services/redux/slices/cartSlice";
import modalReducer from "@/services/redux/slices/modalSlice";
import wishlistReducer from "@/services/redux/slices/wishlistSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      userAuth: userAuthReducer,
      websiteCart: websiteCartReducer,
      cart: cartReducer,
      modal: modalReducer,
      wishlist: wishlistReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
