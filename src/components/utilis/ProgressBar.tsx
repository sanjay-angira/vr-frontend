"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";

export default function ProgressBar() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    NProgress.start();
    const timeout = setTimeout(() => {
      NProgress.done();
    }, 300); // small delay for smoothness

    return () => {
      clearTimeout(timeout);
      NProgress.done();
    };
  }, [pathname]);

  return null; // nothing to render, just controls progress bar
}