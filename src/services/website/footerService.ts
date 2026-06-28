import { getData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import type { FooterApiResponse, FooterData } from "@/types/footer";

const FALLBACK_FOOTER: FooterData = {
  settings: {
    email: "vrindavanrasa@gmail.com",
    phone: "+91 9043534534",
    address: "Mathura, India",
    copyrightText: `© ${new Date().getFullYear()} Vrindavan Rasa. All rights reserved.`,
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

export function getFallbackFooterData(): FooterData {
  return FALLBACK_FOOTER;
}

function normalizeFooterData(data: FooterData): FooterData {
  return {
    settings: data.settings ?? null,
    sections: (data.sections ?? []).map((section) => ({
      ...section,
      items: section.items ?? [],
      socialLinks: section.socialLinks ?? [],
      paymentMethods: section.paymentMethods ?? [],
    })),
  };
}

export async function fetchFooterData(): Promise<FooterData> {
  try {
    const response = (await getData(API_ENDPOINTS.FOOTER.PUBLIC, undefined, {
      auth: false,
    })) as FooterApiResponse;
    if (response?.success && response?.data) {
      return normalizeFooterData(response.data);
    }
  } catch {
    return FALLBACK_FOOTER;
  }

  return FALLBACK_FOOTER;
}
