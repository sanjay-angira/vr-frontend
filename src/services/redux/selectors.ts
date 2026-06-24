import type { RootState } from "@/services/redux";

export const selectUserAuth = (state: RootState) => state.userAuth;
export const selectAdminAuth = (state: RootState) => state.adminAuth;
