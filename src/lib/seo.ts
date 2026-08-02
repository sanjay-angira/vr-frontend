import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

const SITE_NAME = "Vrindavan Rasa";
const DEFAULT_OG_IMAGE = "/og-image.jpg";

export type SeoPageKey =
  | "home"
  | "shop"
  | "categories"
  | "about"
  | "contact"
  | "blog"
  | "faq"
  | "privacy"
  | "terms"
  | "shipping"
  | "returnRefund"
  | "cancellation";

type SeoEntry = {
  title: string;
  description: string;
  keywords?: string;
  path: string;
};

/** Static page SEO from the Vrindavan Rasa metadata brief. */
export const SEO_PAGES: Record<SeoPageKey, SeoEntry> = {
  home: {
    title: "Vrindavan Rasa | Premium Grocery, Puja Items & Daily Essentials",
    description:
      "Shop premium groceries, spices, dry fruits, puja items, sweets, and daily essentials at Vrindavan Rasa. Fresh quality, secure payments, and fast delivery across India.",
    keywords:
      "Vrindavan Rasa, online grocery, grocery shopping India, puja items, spices, dry fruits, sweets, daily essentials, pooja products, premium grocery",
    path: "/",
  },
  shop: {
    title: "Shop Premium Groceries & Daily Essentials | Vrindavan Rasa",
    description:
      "Browse premium groceries, spices, dry fruits, sweets, pooja essentials, personal care, and everyday products at the best prices.",
    path: "/products",
  },
  categories: {
    title: "Shop by Categories | Grocery, Puja Items & Daily Essentials",
    description:
      "Explore groceries, spices, dry fruits, pooja products, sweets, health foods, kitchen essentials, and more.",
    path: "/categories",
  },
  about: {
    title: "About Vrindavan Rasa | Trusted Grocery & Spiritual Store",
    description:
      "Learn about Vrindavan Rasa, your trusted destination for premium groceries, pooja essentials, sweets, spices, and daily essentials.",
    path: "/about-us",
  },
  contact: {
    title: "Contact Vrindavan Rasa | Customer Support & Assistance",
    description:
      "Need help? Contact Vrindavan Rasa for product inquiries, order support, shipping information, and customer assistance.",
    path: "/contact-us",
  },
  blog: {
    title: "Healthy Living, Grocery Tips & Recipes | Vrindavan Rasa Blog",
    description:
      "Read expert tips on healthy living, recipes, spices, nutrition, pooja traditions, grocery shopping, and wellness.",
    path: "/blogs",
  },
  faq: {
    title: "Frequently Asked Questions | Vrindavan Rasa",
    description:
      "Find answers about orders, shipping, payments, returns, products, and customer support.",
    path: "/faq",
  },
  privacy: {
    title: "Privacy Policy | Vrindavan Rasa",
    description:
      "Read the Privacy Policy of Vrindavan Rasa to understand how we collect, use, and protect your personal information.",
    path: "/privacy-policy",
  },
  terms: {
    title: "Terms & Conditions | Vrindavan Rasa",
    description:
      "Review the Terms & Conditions governing the use of Vrindavan Rasa and our products and services.",
    path: "/terms-and-conditions",
  },
  shipping: {
    title: "Shipping Policy | Vrindavan Rasa",
    description:
      "Learn about shipping methods, delivery timelines, and order processing at Vrindavan Rasa.",
    path: "/shipping-policy",
  },
  returnRefund: {
    title: "Return & Refund Policy | Vrindavan Rasa",
    description:
      "Understand our return, replacement, and refund policy for orders placed at Vrindavan Rasa.",
    path: "/return-refund-policy",
  },
  cancellation: {
    title: "Cancellation Policy | Vrindavan Rasa",
    description:
      "Read the cancellation policy for orders placed on Vrindavan Rasa.",
    path: "/cancellation-policy",
  },
};

/** CMS slug → SEO page key (supports common slug variants). */
const CMS_SLUG_SEO: Record<string, SeoPageKey> = {
  "about-us": "about",
  about: "about",
  faq: "faq",
  faqs: "faq",
  "privacy-policy": "privacy",
  privacy: "privacy",
  "terms-and-conditions": "terms",
  "terms-conditions": "terms",
  terms: "terms",
  "shipping-policy": "shipping",
  shipping: "shipping",
  "return-refund-policy": "returnRefund",
  "return-and-refund-policy": "returnRefund",
  "returns-policy": "returnRefund",
  returns: "returnRefund",
  "cancellation-policy": "cancellation",
  cancellation: "cancellation",
};

function absoluteUrl(path: string): string {
  const site = getSiteUrl();
  if (!path || path === "/") return site;
  return `${site}${path.startsWith("/") ? path : `/${path}`}`;
}

function ogImageUrl(image?: string | null): string {
  if (image?.trim()) {
    if (/^https?:\/\//i.test(image)) return image.trim();
    return absoluteUrl(image.trim());
  }
  return absoluteUrl(DEFAULT_OG_IMAGE);
}

type BuildMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  image?: string | null;
  robots?: Metadata["robots"];
  type?: "website" | "article";
};

/** Build Next.js Metadata with canonical, Open Graph, and Twitter cards. */
export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  image,
  robots,
  type = "website",
}: BuildMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const ogImage = ogImageUrl(image);

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: url },
    robots,
    openGraph: {
      type,
      siteName: SITE_NAME,
      title,
      description,
      url,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function getStaticPageMetadata(key: SeoPageKey): Metadata {
  const page = SEO_PAGES[key];
  return buildPageMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
    keywords: page.keywords,
  });
}

export function getCmsPageMetadata(
  slug: string,
  fallbackTitle?: string
): Metadata | null {
  const key = CMS_SLUG_SEO[slug.trim().toLowerCase()];
  if (key) {
    const page = SEO_PAGES[key];
    return buildPageMetadata({
      title: page.title,
      description: page.description,
      path: `/${slug.trim().toLowerCase()}`,
      keywords: page.keywords,
    });
  }

  if (!fallbackTitle) return null;

  return buildPageMetadata({
    title: `${fallbackTitle} | ${SITE_NAME}`,
    description: `${fallbackTitle} — ${SITE_NAME}.`,
    path: `/${slug}`,
  });
}

export function getProductPageMetadata(productName: string, options?: {
  description?: string;
  slug?: string;
  image?: string | null;
}): Metadata {
  const name = productName.trim() || "Product";
  const title = `${name} | Buy Online at Best Price | ${SITE_NAME}`;
  const description =
    options?.description?.trim() ||
    `Buy ${name} online from Vrindavan Rasa. Premium quality, affordable prices, secure payments, and fast delivery across India.`;

  return buildPageMetadata({
    title,
    description: description.slice(0, 320),
    path: options?.slug ? `/product/${options.slug}` : "/products",
    image: options?.image,
  });
}

export function getCategoryPageMetadata(categoryName: string, options?: {
  description?: string;
  slug?: string;
  image?: string | null;
}): Metadata {
  const name = categoryName.trim() || "Category";
  const title = `${name} | Buy Premium ${name} Online | ${SITE_NAME}`;
  const description =
    options?.description?.trim() ||
    `Shop premium ${name} online at Vrindavan Rasa. Fresh quality, competitive prices, secure payments, and fast delivery across India.`;

  return buildPageMetadata({
    title,
    description: description.slice(0, 320),
    path: options?.slug ? `/category/${options.slug}` : "/categories",
    image: options?.image,
  });
}

/** Private / transactional pages — do not index. */
export const NOINDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

/** Search results — noindex but allow following links. */
export const NOINDEX_FOLLOW_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
};

/** Resolve CMS slug to a known SEO page key (faq, privacy, about, …). */
export function getCmsSeoKey(slug: string): SeoPageKey | null {
  return CMS_SLUG_SEO[slug.trim().toLowerCase()] || null;
}

/** Prefer getOrganizationSchema from @/lib/schema */
export function getOrganizationJsonLd(): Record<string, unknown> {
  const site = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: site,
    logo: absoluteUrl("/apple-touch-icon.png"),
    description: SEO_PAGES.home.description,
  };
}

export { SITE_NAME, DEFAULT_OG_IMAGE, absoluteUrl as absoluteSeoUrl };
