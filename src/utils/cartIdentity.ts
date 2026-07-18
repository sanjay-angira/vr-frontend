import { getJson, STORAGE_KEYS, tokenStorage } from "@/services/api/storage";
import { getSessionId } from "@/utils/sessionId";

export type CartIdentity = {
  userId?: number;
  sessionId?: string;
};

/**
 * Backend cart APIs identify carts by explicit userId or sessionId (not JWT).
 * Always keep a guest sessionId; also send userId when logged in so the API
 * can merge guest cart into the user cart.
 */
export function getCartIdentity(): CartIdentity {
  const token = tokenStorage.getUserAccessToken();
  const profile = getJson<{ id?: string | number }>(STORAGE_KEYS.userProfile);
  const parsedId =
    profile?.id != null && profile.id !== ""
      ? Number(profile.id)
      : NaN;

  const sessionId = getSessionId();

  if (token && Number.isFinite(parsedId) && parsedId > 0) {
    return { userId: parsedId, sessionId };
  }

  return { sessionId };
}

export function appendCartIdentity(
  url: string,
  identity: CartIdentity = getCartIdentity()
): string {
  const params = new URLSearchParams();
  if (identity.userId != null) params.set("userId", String(identity.userId));
  if (identity.sessionId) params.set("sessionId", identity.sessionId);
  const qs = params.toString();
  if (!qs) return url;
  return url.includes("?") ? `${url}&${qs}` : `${url}?${qs}`;
}
