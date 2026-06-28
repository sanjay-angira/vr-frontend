import type { FooterData, FooterLinkItem } from "@/types/footer";

type FooterSettings = {
  email?: string;
  phone?: string;
  address?: string;
  copyrightText?: string;
  status?: boolean;
};

type FooterSection = {
  id: number;
  title: string;
  type: string;
  position: number;
  status?: boolean;
};

type FooterLinkRow = {
  id: number;
  label: string;
  url?: string;
  icon?: string;
  position?: number;
  status?: boolean;
  sectionId?: number;
  section?: FooterSection;
};

function mapLinkRows(rows: FooterLinkRow[], sectionId: number): FooterLinkItem[] {
  return rows
    .filter(
      (row) =>
        (row.sectionId === sectionId || row.section?.id === sectionId) &&
        row.status !== false
    )
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((row) => ({
      id: row.id,
      label: row.label,
      url: row.url,
      icon: row.icon,
      position: row.position ?? 0,
    }));
}

function sectionLinksForType(
  section: FooterSection,
  items: FooterLinkRow[],
  socialLinks: FooterLinkRow[],
  paymentMethods: FooterLinkRow[]
) {
  if (section.type === "social") {
    const links = mapLinkRows(socialLinks, section.id);
    return {
      items: links.length ? links : mapLinkRows(items, section.id),
      socialLinks: links,
      paymentMethods: [] as FooterLinkItem[],
    };
  }

  if (section.type === "payment") {
    const methods = mapLinkRows(paymentMethods, section.id);
    return {
      items: methods,
      socialLinks: [] as FooterLinkItem[],
      paymentMethods: methods,
    };
  }

  return {
    items: mapLinkRows(items, section.id),
    socialLinks: mapLinkRows(socialLinks, section.id),
    paymentMethods: mapLinkRows(paymentMethods, section.id),
  };
}

export function buildFooterPreviewData(
  settings: FooterSettings,
  sections: FooterSection[],
  items: FooterLinkRow[],
  socialLinks: FooterLinkRow[],
  paymentMethods: FooterLinkRow[]
): FooterData {
  const activeSections = sections
    .filter((section) => section.status !== false)
    .sort((a, b) => a.position - b.position);

  return {
    settings: {
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      copyrightText: settings.copyrightText,
    },
    sections: activeSections.map((section) => {
      const links = sectionLinksForType(
        section,
        items,
        socialLinks,
        paymentMethods
      );

      return {
        id: section.id,
        title: section.title,
        type: section.type,
        position: section.position,
        ...links,
      };
    }),
  };
}
