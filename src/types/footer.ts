export type FooterSectionType = "menu" | "contact";

export interface FooterLinkItem {
  id: number;
  label: string;
  url?: string;
  position: number;
}

export interface FooterListItem extends FooterLinkItem {
  sectionTitle: string;
  sectionPosition: number;
}

export interface FooterSettings {
  email?: string;
  phone?: string;
  address?: string;
  copyrightText?: string;
}

export const STATIC_FOOTER_SETTINGS: FooterSettings = {
  email: "vrindavanrasa@gmail.com",
  phone: "+91 9043534534",
  address: "Mathura, India",
  copyrightText: `© ${new Date().getFullYear()} Vrindavan Rasa. All rights reserved.`,
};

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
  type: FooterSectionType | string;
  position: number;
  items: FooterLinkItem[];
}

export interface FooterData {
  settings: FooterSettings | null;
  sections: FooterSection[];
}

export interface AdminFooterSection {
  id: number;
  title: string;
  type: FooterSectionType | string;
  position: number;
  status?: boolean;
}

export interface AdminFooterLinkRow {
  id: number;
  label: string;
  url?: string;
  position?: number;
  status?: boolean;
  sectionId?: number;
  section?: AdminFooterSection;
}
