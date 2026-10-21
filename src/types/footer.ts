export interface FooterLinkItem {
  id: number;
  label: string;
  url: string;
  position: number;
}

export const STATIC_FOOTER_SOCIAL = [
  { id: "facebook", label: "Facebook", url: "https://www.facebook.com/" },
  { id: "instagram", label: "Instagram", url: "https://www.instagram.com/" },
  { id: "x", label: "X", url: "https://x.com/" },
  { id: "pinterest", label: "Pinterest", url: "https://www.pinterest.com/" },
  { id: "youtube", label: "YouTube", url: "https://www.youtube.com/" },
] as const;

export interface FooterSection {
  id: number;
  title: string;
  position: number;
  items: FooterLinkItem[];
}
