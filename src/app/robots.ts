import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

/**
 * Public storefront crawl rules.
 * Blocks admin, account, and checkout flows that should not be indexed.
 * Google ignores the non-standard Host directive, so it is omitted.
 */
export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/profile",
          "/orders",
          "/wishlist",
          "/addresses",
          "/cart",
          "/checkout",
          "/thank-you",
          "/order-success",
          "/recently-viewed-products",
          "/login",
          "/signup",
          "/api/",
        ],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
  };
}
