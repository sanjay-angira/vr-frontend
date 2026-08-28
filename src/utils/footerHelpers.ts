import type {
  FooterData,
  FooterLinkItem,
  FooterListItem,
  FooterSection,
} from "@/types/footer";
import { STATIC_FOOTER_SETTINGS } from "@/types/footer";

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
  };
}

export function normalizeFooterData(data: FooterData): FooterData {
  return {
    settings: data.settings ?? null,
    sections: sortByPosition(data.sections ?? []).map(normalizeSection),
  };
}

function emptyContactSection(): FooterSection {
  return {
    id: 0,
    title: "Contact Us",
    type: "contact",
    position: 0,
    items: [],
  };
}

export function buildLiveFooterData(items: FooterListItem[]): FooterData {
  const columns = new Map<string, FooterSection>();

  for (const item of sortByPosition(items)) {
    const title = item.sectionTitle?.trim() || "Information";
    let section = columns.get(title);
    if (!section) {
      section = {
        id: columns.size + 1,
        title,
        type: "menu",
        position: Number(item.sectionPosition) || columns.size + 1,
        items: [],
      };
      columns.set(title, section);
    }

    section.items.push({
      id: item.id,
      label: item.label,
      url: item.url,
      position: item.position,
    });
  }

  return normalizeFooterData({
    settings: STATIC_FOOTER_SETTINGS,
    sections: [emptyContactSection(), ...sortByPosition([...columns.values()])],
  });
}

export function getSectionLinks(section: FooterSection): FooterLinkItem[] {
  return section.items ?? [];
}
