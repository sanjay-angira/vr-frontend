"use client";

import { useCallback, useEffect } from "react";
import { userAuthService } from "@/services/website/userAuthService";
import type { CompleteProfilePayload } from "@/services/website/userAuthService";
import { STORAGE_KEYS, getJson, setJson, tokenStorage } from "@/services/api/storage";
import {
  clearUserAuth,
  setUserAuthError,
  setUserAuthLoading,
  setUserCredentials,
  updateUser,
} from "@/services/redux/slices/websiteSlices/userAuthSlice";
import { useAppDispatch, useAppSelector } from "@/services/redux/hooks";
import { selectUserAuth } from "@/services/redux/selectors";
import type { User } from "../../types/user";

export function useUserAuth() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectUserAuth);

  useEffect(() => {
    if (auth.isAuthenticated) return;

    const accessToken = tokenStorage.getUserAccessToken();
    const storedUser = getJson<User>(STORAGE_KEYS.userProfile);

    if (accessToken && storedUser) {
      dispatch(setUserCredentials({ user: storedUser, accessToken }));
    }
  }, [auth.isAuthenticated, dispatch]);

  const login = useCallback(
    (user: User, accessToken: string) => {
      setJson(STORAGE_KEYS.userProfile, user);
      dispatch(setUserCredentials({ user, accessToken }));
    },
    [dispatch]
  );

  const sendOtp = useCallback(
    async (phoneNumber: string) => {
      dispatch(setUserAuthLoading(true));
      dispatch(setUserAuthError(null));

      try {
        await userAuthService.sendWhatsappOtp(phoneNumber);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to send OTP";
        dispatch(setUserAuthError(message));
        throw error;
      } finally {
        dispatch(setUserAuthLoading(false));
      }
    },
    [dispatch]
  );

  const verifyOtp = useCallback(
    async (phoneNumber: string, otp: string) => {
      dispatch(setUserAuthLoading(true));
      dispatch(setUserAuthError(null));

      try {
        const result = await userAuthService.verifyWhatsappOtp(phoneNumber, otp);

        if (result.profileCompleted) {
          setJson(STORAGE_KEYS.userProfile, result.user);
          dispatch(
            setUserCredentials({
              user: result.user,
              accessToken: result.accessToken,
            })
          );
        }

        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Invalid OTP";
        dispatch(setUserAuthError(message));
        throw error;
      } finally {
        dispatch(setUserAuthLoading(false));
      }
    },
    [dispatch]
  );

  const completeProfile = useCallback(
    async (payload: CompleteProfilePayload) => {
      dispatch(setUserAuthLoading(true));
      dispatch(setUserAuthError(null));

      try {
        const result = await userAuthService.completeProfile(payload);

        if (result.profileCompleted) {
          setJson(STORAGE_KEYS.userProfile, result.user);
          dispatch(
            setUserCredentials({
              user: result.user,
              accessToken: result.accessToken,
            })
          );
        }

        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to complete profile";
        dispatch(setUserAuthError(message));
        throw error;
      } finally {
        dispatch(setUserAuthLoading(false));
      }
    },
    [dispatch]
  );

  const verifyEmailOtp = useCallback(
    async (phoneNumber: string, otp: string) => {
      dispatch(setUserAuthLoading(true));
      dispatch(setUserAuthError(null));

      try {
        const result = await userAuthService.verifyEmailOtp(phoneNumber, otp);

        if (result.profileCompleted) {
          setJson(STORAGE_KEYS.userProfile, result.user);
          dispatch(
            setUserCredentials({
              user: result.user,
              accessToken: result.accessToken,
            })
          );
        }

        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Invalid email OTP";
        dispatch(setUserAuthError(message));
        throw error;
      } finally {
        dispatch(setUserAuthLoading(false));
      }
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    userAuthService.logout();
    dispatch(clearUserAuth());
  }, [dispatch]);

  const setLoading = useCallback(
    (isLoading: boolean) => {
      dispatch(setUserAuthLoading(isLoading));
    },
    [dispatch]
  );

  const setError = useCallback(
    (error: string | null) => {
      dispatch(setUserAuthError(error));
    },
    [dispatch]
  );

  const updateProfile = useCallback(
    (data: Partial<User>) => {
      if (auth.user) {
        const nextUser = { ...auth.user, ...data };
        setJson(STORAGE_KEYS.userProfile, nextUser);
      }
      dispatch(updateUser(data));
    },
    [auth.user, dispatch]
  );

  return {
    ...auth,
    login,
    sendOtp,
    verifyOtp,
    completeProfile,
    verifyEmailOtp,
    logout,
    setLoading,
    setError,
    updateProfile,
  };
}
