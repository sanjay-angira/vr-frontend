import { getOgImage, SEO_PAGES, SITE_NAME } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site";

/**
 * Link-preview crawlers (WhatsApp, Facebook, X, Slack, …) wait for the full
 * HTML and give up after a few seconds. They must not be treated as Googlebot.
 */
const LINK_PREVIEW_BOT =
  /WhatsApp|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot|Pinterest|embedly|redditbot|vkShare/i;

export function isLinkPreviewBot(userAgent: string | null): boolean {
  return LINK_PREVIEW_BOT.test(userAgent || "");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Tiny homepage document so a crawler can build the share card without the store API. */
export function homepageLinkPreviewHtml(): string {
  const home = SEO_PAGES.home;
  const site = getSiteUrl();
  const image = getOgImage();
  const title = escapeHtml(home.title);
  const description = escapeHtml(home.description);
  const imageUrl = escapeHtml(image.url);
  const siteName = escapeHtml(SITE_NAME);
  const imageAlt = escapeHtml(image.alt || SITE_NAME);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${title}</title>
<meta name="description" content="${description}"/>
<link rel="canonical" href="${escapeHtml(site)}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="${siteName}"/>
<meta property="og:locale" content="en_IN"/>
<meta property="og:url" content="${escapeHtml(site)}"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${description}"/>
<meta property="og:image" content="${imageUrl}"/>
<meta property="og:image:secure_url" content="${imageUrl}"/>
<meta property="og:image:type" content="image/jpeg"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="${imageAlt}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${description}"/>
<meta name="twitter:image" content="${imageUrl}"/>
</head>
<body>
<img src="${imageUrl}" alt="${imageAlt}" width="1200" height="630"/>
</body>
</html>`;
}
