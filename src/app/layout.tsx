import { getOgImage, SEO_PAGES, SITE_NAME } from "@/lib/seo";
import { getOrganizationSchema } from "@/lib/schema";
import { getSiteUrl } from "@/lib/site";
import type { Metadata } from "next";
import { Suspense } from "react";
import { StoreProvider } from "@/services/redux/provider";
import { WebsiteProgressBar } from "@/components/shared/WebsiteProgressBar";
import AuthModals from "@/components/auth/AuthModals";
import { WebsiteFooter } from "@/components/footer/WebsiteFooter";
import { WebsiteHeader } from "@/components/header/WebsiteHeader";
import { CartHydrator } from "@/components/cart/CartHydrator";
import { WishlistHydrator } from "@/components/wishlist/useWishlist";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@/styles/index.css";
import "./globals.css";

export const dynamic = "force-dynamic";

const home = SEO_PAGES.home;
const siteUrl = getSiteUrl();
const ogImage = getOgImage();

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
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: [{ url: "/logo/apple-touch-icon.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    title: home.title,
    description:
      "Shop premium groceries, spices, dry fruits, puja items, sweets, and daily essentials with fast delivery across India.",
    url: siteUrl,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: home.title,
    description:
      "Premium groceries, puja items, spices, dry fruits, sweets, and daily essentials delivered across India.",
    images: [ogImage.url],
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
      <body className="website-layout min-h-full flex flex-col">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Manrope:wght@500;600;700&family=Poppins:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationLd),
          }}
        />
        <StoreProvider>
          <WebsiteProgressBar />
          <CartHydrator />
          <WishlistHydrator />
          <AuthModals />
          <Suspense fallback={null}>
            <WebsiteHeader />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Suspense fallback={null}>
            <WebsiteFooter />
          </Suspense>
          <ToastContainer
            position="top-right"
            autoClose={4000}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="colored"
            style={{ zIndex: 10000 }}
          />
        </StoreProvider>
      </body>
    </html>
  );
}
