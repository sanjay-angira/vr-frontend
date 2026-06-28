export type FooterSectionType = "menu" | "contact" | "social" | "payment";

export interface FooterLinkItem {
  id: number;
  label: string;
  url?: string;
  icon?: string;
  position: number;
}

export interface FooterSettings {
  email?: string;
  phone?: string;
  address?: string;
  copyrightText?: string;
}

export interface FooterSection {
  id: number;
  title: string;
  type: FooterSectionType | string;
  position: number;
  items: FooterLinkItem[];
  socialLinks: FooterLinkItem[];
  paymentMethods: FooterLinkItem[];
}

export interface FooterData {
  settings: FooterSettings | null;
  sections: FooterSection[];
}

export interface FooterApiResponse {
  success: boolean;
  message: string;
  data: FooterData;
}

/** Admin panel — extends public types with DB fields */
export interface AdminFooterSettings extends FooterSettings {
  id?: number;
  status?: boolean;
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
  icon?: string;
  position?: number;
  status?: boolean;
  sectionId?: number;
  section?: AdminFooterSection;
}
