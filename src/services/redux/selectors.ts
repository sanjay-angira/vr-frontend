import type { RootState } from "@/services/redux";

export const selectUserAuth = (state: RootState) => state.userAuth;
