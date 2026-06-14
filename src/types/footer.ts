export interface FooterLinkItem {
  id: number;
  label: string;
  url?: string;
  icon?: string;
  position: number;
}

export interface FooterSection {
  id: number;
  title: string;
  type: 'menu' | 'contact' | 'social' | 'payment' | string;
  position: number;
  items: FooterLinkItem[];
  socialLinks: FooterLinkItem[];
  paymentMethods: FooterLinkItem[];
}

export interface FooterSettings {
  email?: string;
  phone?: string;
  address?: string;
  copyrightText?: string;
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
