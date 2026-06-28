import { getData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import type { FooterApiResponse, FooterData } from "@/types/footer";
import { normalizeFooterData } from "@/utils/footerHelpers";

const FALLBACK_FOOTER: FooterData = {
  settings: {
    email: "vrindavanrasa@gmail.com",
    phone: "+91 9043534534",
    address: "Mathura, India",
    copyrightText: `© ${new Date().getFullYear()} Vrindavan Rasa. All rights reserved.`,
  },
  sections: [],
};

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
