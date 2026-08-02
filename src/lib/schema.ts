import { SEO_PAGES, SITE_NAME, absoluteSeoUrl } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

/** Shared JSON-LD script payload type. */
export type JsonLdObject = Record<string, unknown>;

function siteUrl(): string {
  return getSiteUrl();
}

function abs(path: string): string {
  return absoluteSeoUrl(path);
}

export function getOrganizationSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl(),
    logo: abs("/apple-touch-icon.png"),
    description: SEO_PAGES.home.description,
  };
}

/** Home: WebSite + SearchAction (uses /products?search=). */
export function getWebSiteSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: siteUrl(),
    name: SITE_NAME,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl()}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

export function getCollectionPageSchema(options: {
  name: string;
  path: string;
  description?: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: options.name,
    url: abs(options.path),
    ...(options.description
      ? { description: options.description.slice(0, 500) }
      : {}),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: siteUrl(),
    },
  };
}

export function getWebPageSchema(options: {
  name: string;
  path: string;
  description?: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: options.name,
    url: abs(options.path),
    ...(options.description ? { description: options.description } : {}),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: siteUrl(),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl(),
    },
  };
}

export function getProductSchema(options: {
  name: string;
  description?: string;
  images?: string[];
  sku?: string | null;
  brandName?: string | null;
  price?: number | null;
  currency?: string;
  inStock?: boolean;
  path: string;
  ratingValue?: number;
  reviewCount?: number;
}): JsonLdObject {
  const images = (options.images || [])
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => (/^https?:\/\//i.test(url) ? url : abs(url)));

  const price =
    options.price != null && Number.isFinite(options.price)
      ? Number(options.price).toFixed(2)
      : undefined;

  const schema: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: options.name,
    ...(options.description ? { description: options.description } : {}),
    ...(images.length ? { image: images } : {}),
    ...(options.sku ? { sku: options.sku } : {}),
    brand: {
      "@type": "Brand",
      name: options.brandName?.trim() || SITE_NAME,
    },
  };

  if (price) {
    schema.offers = {
      "@type": "Offer",
      price,
      priceCurrency: options.currency || "INR",
      availability: options.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: abs(options.path),
    };
  }

  if (
    options.ratingValue != null &&
    options.ratingValue > 0 &&
    options.reviewCount != null &&
    options.reviewCount > 0
  ) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: options.ratingValue,
      reviewCount: options.reviewCount,
    };
  }

  return schema;
}

export function getBlogPostingSchema(options: {
  title: string;
  description?: string;
  image?: string | null;
  path: string;
  datePublished?: string;
  authorName?: string;
}): JsonLdObject {
  const image = options.image?.trim();
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: options.title,
    ...(options.description ? { description: options.description } : {}),
    ...(image
      ? { image: [/^https?:\/\//i.test(image) ? image : abs(image)] }
      : {}),
    mainEntityOfPage: abs(options.path),
    ...(options.datePublished ? { datePublished: options.datePublished } : {}),
    author: {
      "@type": "Person",
      name: options.authorName || "Admin",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: abs("/apple-touch-icon.png"),
      },
    },
  };
}

export function getFaqPageSchema(faqs: FaqItem[]): JsonLdObject | null {
  const cleaned = faqs
    .map((faq) => ({
      question: faq.question?.trim() || "",
      answer: faq.answer?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "",
    }))
    .filter((faq) => faq.question && faq.answer);

  if (!cleaned.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: cleaned.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/** Default FAQs for the FAQ CMS page when no structured CMS FAQs exist. */
export const DEFAULT_SITE_FAQS: FaqItem[] = [
  {
    question: "Do you deliver across India?",
    answer: "Yes, we deliver across India.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept secure online payments including UPI, cards, and other supported payment options at checkout.",
  },
  {
    question: "How can I track my order?",
    answer:
      "After placing an order, you can track it from your account orders page or using the order confirmation details shared with you.",
  },
  {
    question: "What is your return and refund policy?",
    answer:
      "Please review our Return & Refund Policy page for eligibility, timelines, and the process to request a return or refund.",
  },
];

export function getBlogListingSchema(): JsonLdObject {
  return getCollectionPageSchema({
    name: SEO_PAGES.blog.title,
    path: "/blogs",
    description: SEO_PAGES.blog.description,
  });
}

export function getContactPageSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: SEO_PAGES.contact.title,
    url: abs("/contact-us"),
    description: SEO_PAGES.contact.description,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: siteUrl(),
    },
  };
}
