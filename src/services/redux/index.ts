import { configureStore } from "@reduxjs/toolkit";
import adminAuthReducer from "@/services/redux/slices/adminSlices/adminAuthSlice";
import userAuthReducer from "@/services/redux/slices/websiteSlices/userAuthSlice";
import websiteCartReducer from "@/services/redux/slices/websiteSlices/cartSlice";
import cartReducer from "@/services/redux/slices/websiteSlices/cartSlice";
import modalReducer from "@/services/redux/slices/websiteSlices/modalSlice";
import wishlistReducer from "@/services/redux/slices/websiteSlices/wishlistSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      adminAuth: adminAuthReducer,
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
