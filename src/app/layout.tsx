import {
  DEFAULT_OG_IMAGE,
  SEO_PAGES,
  SITE_NAME,
  absoluteSeoUrl,
} from "@/lib/seo";
import { getOrganizationSchema } from "@/lib/schema";
import { getSiteUrl } from "@/lib/site";
import type { Metadata } from "next";
import { StoreProvider } from "@/services/redux/provider";
import "./globals.css";

const home = SEO_PAGES.home;
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: home.title,
    template: `%s`,
  },
  description: home.description,
  keywords: home.keywords,
  applicationName: SITE_NAME,
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon-32.png",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: home.title,
    description:
      "Shop premium groceries, spices, dry fruits, puja items, sweets, and daily essentials with fast delivery across India.",
    url: siteUrl,
    images: [{ url: absoluteSeoUrl(DEFAULT_OG_IMAGE) }],
  },
  twitter: {
    card: "summary_large_image",
    title: home.title,
    description:
      "Premium groceries, puja items, spices, dry fruits, sweets, and daily essentials delivered across India.",
    images: [absoluteSeoUrl(DEFAULT_OG_IMAGE)],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationLd = getOrganizationSchema();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationLd),
          }}
        />
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
