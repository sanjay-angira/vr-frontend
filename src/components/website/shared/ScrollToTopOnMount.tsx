"use client";

import { useLayoutEffect } from "react";

/** Ensures product loading/detail UI paints from the top of the page. */
export function ScrollToTopOnMount() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return null;
}
