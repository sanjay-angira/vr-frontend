export type AnnouncementBarData = {
    id: number;
    isActive: boolean;
    message: string;
    linkText: string | null;
    linkUrl: string | null;
    backgroundColor: string;
    textColor: string;
  };
  
  export type HeaderSettingsData = {
    logoUrl: string | null;
    stickyHeader: boolean;
    showSearch: boolean;
    showCart: boolean;
    showWishlist: boolean;
    showAccount: boolean;
    backgroundColor: string;
    textColor: string;
  };
  
  export type MenuItemNode = {
    id: number;
    label: string;
    url: string;
    children: MenuItemNode[];
  };
  
  export type WebsiteHeaderData = {
    announcementBar: AnnouncementBarData | null;
    header: HeaderSettingsData;
    menu: MenuItemNode[];
  };
  
  export type WebsiteHeaderApiResponse = {
    success: boolean;
    message: string;
    data: WebsiteHeaderData;
    statusCode?: number;
  };
  
  export type AdminHeaderSettings = HeaderSettingsData & {
    activeMenuId?: number | null;
  };
  
  export type AdminAnnouncementBar = AnnouncementBarData & {
    startDate?: string | null;
    endDate?: string | null;
    priority: number;
    createdAt?: string;
    updatedAt?: string;
  };
  
  export type AdminMenuItem = {
    id: number;
    menuId: number;
    parentId: number | null;
    label: string;
    url: string;
    sortOrder: number;
    isActive: boolean;
  };
  
  export type AdminMenu = {
    id: number;
    name: string;
    slug: string;
    isActive: boolean;
    items: AdminMenuItem[];
  };
  
  export const DEFAULT_WEBSITE_HEADER: WebsiteHeaderData = {
    announcementBar: null,
    header: {
      logoUrl: null,
      stickyHeader: true,
      showSearch: true,
      showCart: true,
      showWishlist: true,
      showAccount: true,
      backgroundColor: "#ffffff",
      textColor: "#111111",
    },
    menu: [
      { id: 1, label: "Home", url: "/", children: [] },
      { id: 2, label: "Shop", url: "/shop", children: [] },
    ],
  };
  