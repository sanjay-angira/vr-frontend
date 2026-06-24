"use client";

import { useEffect, useState } from "react";
import {
  mapBackendAdminUser,
  type BackendAdminUser,
} from "@/components/admin/auth/AdminLoginForm";
import { STORAGE_KEYS, getJson, tokenStorage } from "@/services/api/storage";
import { useAppDispatch, useAppSelector } from "@/services/redux/hooks";
import { selectAdminAuth } from "@/services/redux/selectors";
import { setAdminCredentials } from "@/services/redux/slices/adminSlices/adminAuthSlice";

export function useAdminAuth() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAdminAuth);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated) {
      setIsHydrated(true);
      return;
    }

    const accessToken = tokenStorage.getAdminAccessToken();
    const storedUser = getJson<BackendAdminUser>(STORAGE_KEYS.adminUser);

    if (accessToken && storedUser) {
      dispatch(
        setAdminCredentials({
          admin: mapBackendAdminUser(storedUser),
          accessToken,
        })
      );
    }

    setIsHydrated(true);
  }, [auth.isAuthenticated, dispatch]);

  return { ...auth, isHydrated };
}
