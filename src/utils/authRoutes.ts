const AUTH_PAGE_PATHS = ["/login", "/signup"] as const;

export function isAuthPagePath(pathname: string | null): boolean {
  if (!pathname) {
    return false;
  }

  return AUTH_PAGE_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
