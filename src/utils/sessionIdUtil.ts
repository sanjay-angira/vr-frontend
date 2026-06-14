// src/utils/sessionIdUtil.ts

const SESSION_ID_KEY = 'spice_session_id';

/**
 * Generate a unique session ID for guest users
 */
function generateSessionId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get or create session ID for guest users
 * SessionId is stored in localStorage and persists across browser sessions
 */
export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);

  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Clear session ID (use when user logs in)
 */
export function clearSessionId(): void {
  localStorage.removeItem(SESSION_ID_KEY);
}

/**
 * Check if current user is guest (no token)
 */
export function isGuestUser(): boolean {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  return !token;
}

/**
 * Get session info
 */
export function getSessionInfo(): {
  sessionId: string;
  isGuest: boolean;
} {
  return {
    sessionId: getSessionId(),
    isGuest: isGuestUser(),
  };
}
