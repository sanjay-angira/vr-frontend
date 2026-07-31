import type {
  AdminAnnouncementBar,
  AdminHeaderSettings,
  AdminMenu,
  AdminMenuItem,
  AnnouncementBarData,
  MenuItemNode,
  WebsiteHeaderData,
} from "@/types/header";

function buildMenuTree(
  items: AdminMenuItem[],
  parentId: number | null = null
): MenuItemNode[] {
  return items
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
    .map((item) => ({
      id: item.id,
      label: item.label,
      url: item.url,
      children: buildMenuTree(items, item.id),
    }));
}

function resolveActiveMenu(
  activeMenuId: number | null | undefined,
  menus: AdminMenu[]
): AdminMenu | null {
  if (activeMenuId) {
    const selected = menus.find(
      (menu) => menu.id === activeMenuId && menu.isActive
    );
    if (selected) return selected;
  }

  return (
    menus.find((menu) => menu.slug === "header" && menu.isActive) ??
    menus.find((menu) => menu.isActive) ??
    null
  );
}

export function pickActiveAnnouncementBar(
  bars: AdminAnnouncementBar[]
): AnnouncementBarData | null {
  const now = new Date();

  const eligible = bars
    .filter((bar) => bar.isActive && bar.message?.trim())
    .filter((bar) => {
      if (bar.startDate && new Date(bar.startDate) > now) return false;
      if (bar.endDate && new Date(bar.endDate) < now) return false;
      return true;
    })
    .sort(
      (a, b) =>
        (b.priority ?? 0) - (a.priority ?? 0) || (b.id ?? 0) - (a.id ?? 0)
    );

  if (!eligible.length) return null;

  const bar = eligible[0];
  return {
    id: bar.id,
    isActive: bar.isActive,
    message: bar.message,
    linkText: bar.linkText,
    linkUrl: bar.linkUrl,
    backgroundColor: bar.backgroundColor,
    textColor: bar.textColor,
  };
}

export function buildHeaderPreviewData(
  headerSettings: AdminHeaderSettings,
  bars: AdminAnnouncementBar[],
  menus: AdminMenu[]
): WebsiteHeaderData {
  const menu = resolveActiveMenu(headerSettings.activeMenuId, menus);
  const activeItems = (menu?.items ?? []).filter((item) => item.isActive);

  return {
    announcementBar: pickActiveAnnouncementBar(bars),
    header: {
      logoUrl: headerSettings.logoUrl ?? null,
      mobileLogoUrl: headerSettings.mobileLogoUrl ?? null,
      stickyHeader: headerSettings.stickyHeader,
      showSearch: headerSettings.showSearch,
      showCart: headerSettings.showCart,
      showWishlist: headerSettings.showWishlist,
      showAccount: headerSettings.showAccount,
      backgroundColor: headerSettings.backgroundColor,
      textColor: headerSettings.textColor,
    },
    menu: buildMenuTree(activeItems),
  };
}
