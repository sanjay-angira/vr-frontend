import type { FooterData, FooterLinkItem, FooterSection } from "@/types/footer";
import { STATIC_FOOTER_SETTINGS } from "@/types/footer";

export function sortByPosition<T extends { position?: number }>(
  items: T[],
): T[] {
  return [...items].sort(
    (a, b) => Number(a.position ?? 0) - Number(b.position ?? 0),
  );
}

function normalizeSection(section: FooterSection): FooterSection {
  return {
    ...section,
    position: Number(section.position) || 0,
    items: sortByPosition(section.items ?? []),
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

export function buildLiveFooterData(sections: FooterSection[]): FooterData {
  return normalizeFooterData({
    settings: STATIC_FOOTER_SETTINGS,
    sections: [emptyContactSection(), ...sections],
  });
}

export function getSectionLinks(section: FooterSection): FooterLinkItem[] {
  return section.items ?? [];
}
