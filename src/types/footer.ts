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

export interface FooterSocialLinks {
  id: number;
  label: string;
  url?: string;
  icon?: string;
  position: number;
}

export interface FooterPaymentMethods {
  id: number;
  label: string;
  url?: string;
  icon?: string;
  position: number;
}


export interface FooterSection {
  id: number;
  title: string;
  type: string;
  position: number;
  items: FooterLinkItem[];
  socialLinks: FooterSocialLinks[];
  paymentMethods: FooterPaymentMethods[];
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
