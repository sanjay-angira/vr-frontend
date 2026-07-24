import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

/**
 * Public storefront crawl rules.
 * Blocks admin, account, and checkout flows that should not be indexed.
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
          "/account",
          "/account/",
          "/cart",
          "/checkout",
          "/thank-you",
          "/order-success",
          "/login",
          "/signup",
          "/api/",
        ],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
