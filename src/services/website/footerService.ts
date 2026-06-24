import { getData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import type { FooterApiResponse, FooterData } from "@/utils/types/footer";

const FALLBACK_FOOTER: FooterData = {
  settings: {
    email: "info@sacredstore.com",
    phone: "+91 9876543210",
    address: "Delhi, India",
    copyrightText: `© ${new Date().getFullYear()} Sacred Store. All rights reserved.`,
  },
  sections: [
    {
      id: 1,
      title: "Products",
      type: "menu",
      position: 1,
      items: [
        { id: 1, label: "Rudraksha", url: "/rudraksha", position: 1 },
        { id: 2, label: "Spiritual Books", url: "/books", position: 2 },
        { id: 3, label: "Divine Sweets", url: "/sweets", position: 3 },
        { id: 4, label: "Rashi Items", url: "/rashi", position: 4 },
      ],
      socialLinks: [],
      paymentMethods: [],
    },
    {
      id: 2,
      title: "Support",
      type: "menu",
      position: 2,
      items: [
        { id: 5, label: "Contact Us", url: "/contact-us", position: 1 },
        { id: 6, label: "Store", url: "/store", position: 2 },
      ],
      socialLinks: [],
      paymentMethods: [],
    },
  ],
};

let cachedFooter: FooterData | null = null;
let footerRequest: Promise<FooterData> | null = null;

export async function fetchFooterData(): Promise<FooterData> {
  if (cachedFooter) {
    return cachedFooter;
  }

  if (!footerRequest) {
    footerRequest = getData(API_ENDPOINTS.FOOTER.PUBLIC, undefined, { auth: false })
      .then((response: FooterApiResponse) => {
        if (response?.success && response?.data) {
          cachedFooter = response.data;
          return response.data;
        }
        return FALLBACK_FOOTER;
      })
      .catch(() => FALLBACK_FOOTER)
      .finally(() => {
        footerRequest = null;
      });
  }

  return footerRequest;
}

export function getFallbackFooterData(): FooterData {
  return FALLBACK_FOOTER;
}
