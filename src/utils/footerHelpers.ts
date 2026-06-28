import type {
  AdminFooterLinkRow,
  AdminFooterSection,
  FooterData,
  FooterLinkItem,
  FooterSection,
  FooterSettings,
} from "@/types/footer";

export function sortByPosition<T extends { position?: number }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => Number(a.position ?? 0) - Number(b.position ?? 0)
  );
}

function normalizeLink(item: FooterLinkItem): FooterLinkItem {
  return { ...item, position: Number(item.position) || 0 };
}

function normalizeSection(section: FooterSection): FooterSection {
  return {
    ...section,
    position: Number(section.position) || 0,
    items: sortByPosition(section.items ?? []).map(normalizeLink),
    socialLinks: sortByPosition(section.socialLinks ?? []).map(normalizeLink),
    paymentMethods: sortByPosition(section.paymentMethods ?? []).map(normalizeLink),
  };
}

export function normalizeFooterData(data: FooterData): FooterData {
  return {
    settings: data.settings ?? null,
    sections: sortByPosition(data.sections ?? []).map(normalizeSection),
  };
}

export function buildDisplaySections(
  sections: FooterSection[],
  settings: FooterSettings | null
): FooterSection[] {
  const sorted = sortByPosition(sections);
  const hasContactSection = sorted.some((section) => section.type === "contact");
  const hasSettingsContact = Boolean(
    settings?.email || settings?.phone || settings?.address
  );

  if (hasContactSection || !hasSettingsContact) {
    return sorted;
  }

  const minPosition = sorted.length
    ? Math.min(...sorted.map((section) => Number(section.position)))
    : 1;

  return sortByPosition([
    {
      id: 0,
      title: "Contact Us",
      type: "contact",
      position: minPosition - 1,
      items: [],
      socialLinks: [],
      paymentMethods: [],
    },
    ...sorted,
  ]);
}

export function getSectionLinks(section: FooterSection): FooterLinkItem[] {
  if (section.type === "social") {
    return section.socialLinks?.length
      ? section.socialLinks
      : (section.items ?? []);
  }

  if (section.type === "payment") {
    return section.paymentMethods?.length
      ? section.paymentMethods
      : (section.items ?? []);
  }

  return section.items ?? [];
}

export function collectSocialLinks(sections: FooterSection[]): {
  links: FooterLinkItem[];
  title: string;
} {
  const links: FooterLinkItem[] = [];
  let title = "Follow Us";

  for (const section of sections) {
    if (section.type === "social") {
      links.push(...getSectionLinks(section));
      title = section.title || title;
    } else if (section.type === "contact" && section.socialLinks?.length) {
      links.push(...section.socialLinks);
    }
  }

  const unique = new Map<number, FooterLinkItem>();
  for (const link of links) {
    unique.set(link.id, link);
  }

  return {
    links: sortByPosition([...unique.values()]),
    title,
  };
}

export function buildFooterGridSections(
  sections: FooterSection[],
  settings: FooterSettings | null
): FooterSection[] {
  const displaySections = buildDisplaySections(sections, settings);
  const { links: socialLinks } = collectSocialLinks(displaySections);
  const gridSections = displaySections.filter((section) => section.type !== "social");

  if (socialLinks.length && !gridSections.some((section) => section.type === "contact")) {
    const minPosition = gridSections.length
      ? Math.min(...gridSections.map((section) => Number(section.position)))
      : 1;

    return sortByPosition([
      {
        id: -1,
        title: "Contact Us",
        type: "contact",
        position: minPosition - 1,
        items: [],
        socialLinks: [],
        paymentMethods: [],
      },
      ...gridSections,
    ]);
  }

  return gridSections;
}

function mapAdminLinkRows(
  rows: AdminFooterLinkRow[],
  sectionId: number
): FooterLinkItem[] {
  return sortByPosition(
    rows.filter(
      (row) =>
        (row.sectionId === sectionId || row.section?.id === sectionId) &&
        row.status !== false
    )
  ).map((row) => ({
    id: row.id,
    label: row.label,
    url: row.url,
    icon: row.icon,
    position: row.position ?? 0,
  }));
}

function sectionLinksForAdminType(
  section: AdminFooterSection,
  items: AdminFooterLinkRow[],
  socialLinks: AdminFooterLinkRow[],
  paymentMethods: AdminFooterLinkRow[]
): Pick<FooterSection, "items" | "socialLinks" | "paymentMethods"> {
  if (section.type === "social") {
    const links = mapAdminLinkRows(socialLinks, section.id);
    return {
      items: links.length ? links : mapAdminLinkRows(items, section.id),
      socialLinks: links,
      paymentMethods: [],
    };
  }

  if (section.type === "payment") {
    const methods = mapAdminLinkRows(paymentMethods, section.id);
    return {
      items: methods,
      socialLinks: [],
      paymentMethods: methods,
    };
  }

  return {
    items: mapAdminLinkRows(items, section.id),
    socialLinks: mapAdminLinkRows(socialLinks, section.id),
    paymentMethods: mapAdminLinkRows(paymentMethods, section.id),
  };
}

export function buildFooterPreviewData(
  settings: FooterSettings,
  sections: AdminFooterSection[],
  items: AdminFooterLinkRow[],
  socialLinks: AdminFooterLinkRow[],
  paymentMethods: AdminFooterLinkRow[]
): FooterData {
  const activeSections = sortByPosition(
    sections.filter((section) => section.status !== false)
  );

  return normalizeFooterData({
    settings: {
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      copyrightText: settings.copyrightText,
    },
    sections: activeSections.map((section) => ({
      id: section.id,
      title: section.title,
      type: section.type,
      position: section.position,
      ...sectionLinksForAdminType(section, items, socialLinks, paymentMethods),
    })),
  });
}
