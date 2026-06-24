"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";

export function WebsiteProgressBar() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    NProgress.start();
    const timeout = setTimeout(() => {
      NProgress.done();
    }, 300);

    return () => {
      clearTimeout(timeout);
      NProgress.done();
    };
  }, [pathname]);

  return null;
}
