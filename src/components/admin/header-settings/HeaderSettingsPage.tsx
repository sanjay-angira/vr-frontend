"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { AdminModal } from "@/components/admin/shared/AdminModal";
import { FormDropdown } from "@/components/admin/forms/shared/FormDropdown";
import { ImageUploadField } from "@/components/admin/forms/shared/ImageUploadField";
import { UPLOAD_PATHS } from "@/components/admin/forms/shared/uploadPaths";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import {
  deleteData,
  getData,
  patchData,
  postData,
} from "@/services/api/apiService";
import { buildHeaderPreviewData } from "@/utils/headerHelpers";
import { HeaderPreviewContent } from "@/components/website/header/HeaderPreviewContent";
import "@/styles/website/header-preview.css";
import type {
  AdminAnnouncementBar,
  AdminHeaderSettings,
  AdminMenu,
  AdminMenuItem,
} from "@/types/header";

type SettingsTab = "header" | "announcement" | "navigation";

function unwrap<T>(response: { data?: T } | T): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data?: T }).data as T;
  }
  return response as T;
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-admin-primary" : "bg-zinc-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}

const defaultHeaderSettings: AdminHeaderSettings = {
  logoUrl: null,
  stickyHeader: true,
  showSearch: true,
  showCart: true,
  showWishlist: true,
  showAccount: true,
  backgroundColor: "#ffffff",
  textColor: "#111111",
  activeMenuId: null,
};

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "header", label: "Header" },
  { id: "announcement", label: "Announcement bar" },
  { id: "navigation", label: "Navigation" },
];

type AnnouncementFormState = {
  id?: number;
  isActive: boolean;
  message: string;
  linkText: string;
  linkUrl: string;
  backgroundColor: string;
  textColor: string;
  startDate: string;
  endDate: string;
  priority: number;
};

const emptyAnnouncementForm = (): AnnouncementFormState => ({
  isActive: true,
  message: "",
  linkText: "",
  linkUrl: "",
  backgroundColor: "#000000",
  textColor: "#ffffff",
  startDate: "",
  endDate: "",
  priority: 0,
});

function toDatetimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

type MenuFormState = {
  id?: number;
  name: string;
  slug: string;
  isActive: boolean;
};

type MenuItemFormState = {
  id?: number;
  menuId: number;
  parentId: number | "";
  label: string;
  url: string;
  sortOrder: number;
  isActive: boolean;
};

const emptyMenuForm = (): MenuFormState => ({
  name: "",
  slug: "",
  isActive: true,
});

const emptyMenuItemForm = (menuId: number): MenuItemFormState => ({
  menuId,
  parentId: "",
  label: "",
  url: "",
  sortOrder: 0,
  isActive: true,
});

export function HeaderSettingsPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as SettingsTab | null) ?? "header";
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    TABS.some((tab) => tab.id === initialTab) ? initialTab : "header"
  );

  const [headerSettings, setHeaderSettings] =
    useState<AdminHeaderSettings>(defaultHeaderSettings);
  const [menus, setMenus] = useState<AdminMenu[]>([]);
  const [headerLoading, setHeaderLoading] = useState(true);
  const [headerSaving, setHeaderSaving] = useState(false);

  const [bars, setBars] = useState<AdminAnnouncementBar[]>([]);
  const [barsLoading, setBarsLoading] = useState(true);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [announcementSaving, setAnnouncementSaving] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState<AnnouncementFormState>(
    emptyAnnouncementForm()
  );

  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  const [navLoading, setNavLoading] = useState(true);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [menuForm, setMenuForm] = useState<MenuFormState>(emptyMenuForm());
  const [itemForm, setItemForm] = useState<MenuItemFormState | null>(null);
  const [navSaving, setNavSaving] = useState(false);

  const loadHeaderData = useCallback(async () => {
    setHeaderLoading(true);
    try {
      const [headerRes, menusRes] = await Promise.all([
        getData(API_ENDPOINTS.HEADER.ADMIN_HEADER),
        getData(API_ENDPOINTS.HEADER.MENUS),
      ]);
      setHeaderSettings(unwrap<AdminHeaderSettings>(headerRes));
      const menuData = unwrap<AdminMenu[]>(menusRes) ?? [];
      setMenus(menuData);
      setSelectedMenuId((current) => current ?? menuData[0]?.id ?? null);
      setNavLoading(false);
    } catch {
      toast.error("Failed to load header settings");
    } finally {
      setHeaderLoading(false);
    }
  }, []);

  const loadBars = useCallback(async () => {
    setBarsLoading(true);
    try {
      const response = await getData(API_ENDPOINTS.HEADER.ANNOUNCEMENT_BARS);
      setBars(unwrap<AdminAnnouncementBar[]>(response) ?? []);
    } catch {
      toast.error("Failed to load announcement bars");
    } finally {
      setBarsLoading(false);
    }
  }, []);

  const loadMenus = useCallback(async () => {
    setNavLoading(true);
    try {
      const response = await getData(API_ENDPOINTS.HEADER.MENUS);
      const data = unwrap<AdminMenu[]>(response) ?? [];
      setMenus(data);
      setSelectedMenuId((current) => current ?? data[0]?.id ?? null);
    } catch {
      toast.error("Failed to load menus");
    } finally {
      setNavLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHeaderData();
    void loadBars();
  }, [loadHeaderData, loadBars]);

  const menuOptions = menus.map((menu) => ({
    value: String(menu.id),
    label: `${menu.name} (${menu.slug})`,
  }));

  const selectedMenu = useMemo(
    () => menus.find((menu) => menu.id === selectedMenuId) ?? null,
    [menus, selectedMenuId]
  );

  const parentOptions = useMemo(() => {
    if (!selectedMenu) return [];
    return selectedMenu.items
      .filter((item) => !item.parentId)
      .map((item) => ({ value: String(item.id), label: item.label }));
  }, [selectedMenu]);

  const topLevelItems = useMemo(() => {
    if (!selectedMenu) return [];
    return selectedMenu.items
      .filter((item) => !item.parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  }, [selectedMenu]);

  const headerPreviewData = useMemo(
    () => buildHeaderPreviewData(headerSettings, bars, menus),
    [headerSettings, bars, menus]
  );

  const getChildren = (parentId: number) =>
    (selectedMenu?.items ?? [])
      .filter((item) => item.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

  const saveHeaderSettings = async () => {
    setHeaderSaving(true);
    try {
      const response = await patchData(
        API_ENDPOINTS.HEADER.ADMIN_HEADER,
        headerSettings
      );
      setHeaderSettings(unwrap<AdminHeaderSettings>(response));
      toast.success("Header settings saved");
    } catch {
      toast.error("Failed to save header settings");
    } finally {
      setHeaderSaving(false);
    }
  };

  const openCreateAnnouncement = () => {
    setAnnouncementForm(emptyAnnouncementForm());
    setAnnouncementModalOpen(true);
  };

  const openEditAnnouncement = (bar: AdminAnnouncementBar) => {
    setAnnouncementForm({
      id: bar.id,
      isActive: bar.isActive,
      message: bar.message,
      linkText: bar.linkText ?? "",
      linkUrl: bar.linkUrl ?? "",
      backgroundColor: bar.backgroundColor,
      textColor: bar.textColor,
      startDate: toDatetimeLocal(bar.startDate),
      endDate: toDatetimeLocal(bar.endDate),
      priority: bar.priority ?? 0,
    });
    setAnnouncementModalOpen(true);
  };

  const saveAnnouncement = async () => {
    if (!announcementForm.message.trim()) {
      toast.error("Message is required");
      return;
    }

    setAnnouncementSaving(true);
    const payload = {
      isActive: announcementForm.isActive,
      message: announcementForm.message.trim(),
      linkText: announcementForm.linkText.trim() || null,
      linkUrl: announcementForm.linkUrl.trim() || null,
      backgroundColor: announcementForm.backgroundColor,
      textColor: announcementForm.textColor,
      startDate: announcementForm.startDate
        ? new Date(announcementForm.startDate).toISOString()
        : null,
      endDate: announcementForm.endDate
        ? new Date(announcementForm.endDate).toISOString()
        : null,
      priority: Number(announcementForm.priority) || 0,
    };

    try {
      if (announcementForm.id) {
        await patchData(
          API_ENDPOINTS.HEADER.ANNOUNCEMENT_BAR_BY_ID(announcementForm.id),
          payload
        );
        toast.success("Announcement bar updated");
      } else {
        await postData(API_ENDPOINTS.HEADER.ANNOUNCEMENT_BARS, payload);
        toast.success("Announcement bar created");
      }
      setAnnouncementModalOpen(false);
      await loadBars();
    } catch {
      toast.error("Failed to save announcement bar");
    } finally {
      setAnnouncementSaving(false);
    }
  };

  const deleteAnnouncement = async (id: number) => {
    if (!window.confirm("Delete this announcement bar?")) return;
    try {
      await deleteData(API_ENDPOINTS.HEADER.ANNOUNCEMENT_BAR_BY_ID(id));
      toast.success("Announcement bar deleted");
      await loadBars();
    } catch {
      toast.error("Failed to delete announcement bar");
    }
  };

  const openCreateMenu = () => {
    setMenuForm(emptyMenuForm());
    setMenuModalOpen(true);
  };

  const openEditMenu = (menu: AdminMenu) => {
    setMenuForm({
      id: menu.id,
      name: menu.name,
      slug: menu.slug,
      isActive: menu.isActive,
    });
    setMenuModalOpen(true);
  };

  const saveMenu = async () => {
    if (!menuForm.name.trim() || !menuForm.slug.trim()) {
      toast.error("Menu name and slug are required");
      return;
    }

    setNavSaving(true);
    const payload = {
      name: menuForm.name.trim(),
      slug: menuForm.slug.trim(),
      isActive: menuForm.isActive,
    };

    try {
      if (menuForm.id) {
        await patchData(API_ENDPOINTS.HEADER.MENU_BY_ID(menuForm.id), payload);
        toast.success("Menu updated");
      } else {
        await postData(API_ENDPOINTS.HEADER.MENUS, payload);
        toast.success("Menu created");
      }
      setMenuModalOpen(false);
      await loadMenus();
      await loadHeaderData();
    } catch {
      toast.error("Failed to save menu");
    } finally {
      setNavSaving(false);
    }
  };

  const deleteMenu = async (id: number) => {
    if (!window.confirm("Delete this menu and all its items?")) return;
    try {
      await deleteData(API_ENDPOINTS.HEADER.MENU_BY_ID(id));
      toast.success("Menu deleted");
      setSelectedMenuId(null);
      await loadMenus();
      await loadHeaderData();
    } catch {
      toast.error("Failed to delete menu");
    }
  };

  const openCreateMenuItem = (parentId?: number) => {
    if (!selectedMenu) return;
    setItemForm({
      ...emptyMenuItemForm(selectedMenu.id),
      parentId: parentId ?? "",
    });
    setItemModalOpen(true);
  };

  const openEditMenuItem = (item: AdminMenuItem) => {
    setItemForm({
      id: item.id,
      menuId: item.menuId,
      parentId: item.parentId ?? "",
      label: item.label,
      url: item.url,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setItemModalOpen(true);
  };

  const saveMenuItem = async () => {
    if (!itemForm) return;
    if (!itemForm.label.trim() || !itemForm.url.trim()) {
      toast.error("Label and URL are required");
      return;
    }

    setNavSaving(true);
    const payload = {
      menuId: itemForm.menuId,
      parentId: itemForm.parentId === "" ? null : Number(itemForm.parentId),
      label: itemForm.label.trim(),
      url: itemForm.url.trim(),
      sortOrder: Number(itemForm.sortOrder) || 0,
      isActive: itemForm.isActive,
    };

    try {
      if (itemForm.id) {
        await patchData(API_ENDPOINTS.HEADER.MENU_ITEM_BY_ID(itemForm.id), payload);
        toast.success("Menu item updated");
      } else {
        await postData(API_ENDPOINTS.HEADER.MENU_ITEMS, payload);
        toast.success("Menu item created");
      }
      setItemModalOpen(false);
      await loadMenus();
    } catch {
      toast.error("Failed to save menu item");
    } finally {
      setNavSaving(false);
    }
  };

  const deleteMenuItem = async (id: number) => {
    if (!window.confirm("Delete this menu item?")) return;
    try {
      await deleteData(API_ENDPOINTS.HEADER.MENU_ITEM_BY_ID(id));
      toast.success("Menu item deleted");
      await loadMenus();
    } catch {
      toast.error("Failed to delete menu item");
    }
  };

  const renderMenuItemRow = (item: AdminMenuItem, depth = 0) => {
    const children = getChildren(item.id);
    return (
      <div key={item.id}>
        <div
          className="flex flex-col gap-3 border-b border-zinc-100 p-4 md:flex-row md:items-center md:justify-between"
          style={{ paddingLeft: `${16 + depth * 20}px` }}
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-zinc-900">{item.label}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  item.isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {item.isActive ? "Active" : "Inactive"}
              </span>
              <span className="text-xs text-zinc-500">Order {item.sortOrder}</span>
            </div>
            <p className="text-sm text-zinc-500">{item.url}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {depth === 0 ? (
              <Button variant="secondary" onClick={() => openCreateMenuItem(item.id)}>
                <Plus size={14} className="mr-1 inline" />
                Child
              </Button>
            ) : null}
            <Button variant="secondary" onClick={() => openEditMenuItem(item)}>
              <Pencil size={16} />
            </Button>
            <Button variant="secondary" onClick={() => deleteMenuItem(item.id)}>
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
        {children.map((child) => renderMenuItemRow(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Header settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage website header, announcement bar, and navigation menus.
        </p>
      </div>

      <div className="grid w-full grid-cols-3 border-b border-zinc-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`w-full border-b-2 px-4 py-3 text-center text-sm font-medium transition ${
              activeTab === tab.id
                ? "border-admin-primary text-admin-primary"
                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "header" ? (
        headerLoading ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500">
            Loading header settings...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-zinc-900">Branding</h2>
                <ImageUploadField
                  label="Logo"
                  value={headerSettings.logoUrl ?? ""}
                  uploadPath={UPLOAD_PATHS.banners}
                  onChange={(value) =>
                    setHeaderSettings((current) => ({
                      ...current,
                      logoUrl: value || null,
                    }))
                  }
                />
                <FormDropdown
                  label="Active navigation menu"
                  value={
                    headerSettings.activeMenuId
                      ? String(headerSettings.activeMenuId)
                      : ""
                  }
                  options={[
                    { value: "", label: "Default (header slug)" },
                    ...menuOptions,
                  ]}
                  onChange={(value) =>
                    setHeaderSettings((current) => ({
                      ...current,
                      activeMenuId: value ? Number(value) : null,
                    }))
                  }
                />
              </div>

              <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-zinc-900">Colors</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Background color"
                    type="color"
                    value={headerSettings.backgroundColor}
                    onChange={(event) =>
                      setHeaderSettings((current) => ({
                        ...current,
                        backgroundColor: event.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Text color"
                    type="color"
                    value={headerSettings.textColor}
                    onChange={(event) =>
                      setHeaderSettings((current) => ({
                        ...current,
                        textColor: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Behavior &amp; icons
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  <Toggle
                    label="Sticky header"
                    checked={headerSettings.stickyHeader}
                    onChange={(stickyHeader) =>
                      setHeaderSettings((current) => ({ ...current, stickyHeader }))
                    }
                  />
                  <Toggle
                    label="Show search"
                    checked={headerSettings.showSearch}
                    onChange={(showSearch) =>
                      setHeaderSettings((current) => ({ ...current, showSearch }))
                    }
                  />
                  <Toggle
                    label="Show cart"
                    checked={headerSettings.showCart}
                    onChange={(showCart) =>
                      setHeaderSettings((current) => ({ ...current, showCart }))
                    }
                  />
                  <Toggle
                    label="Show wishlist"
                    checked={headerSettings.showWishlist}
                    onChange={(showWishlist) =>
                      setHeaderSettings((current) => ({ ...current, showWishlist }))
                    }
                  />
                  <Toggle
                    label="Show account"
                    checked={headerSettings.showAccount}
                    onChange={(showAccount) =>
                      setHeaderSettings((current) => ({ ...current, showAccount }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={saveHeaderSettings} disabled={headerSaving}>
                {headerSaving ? "Saving..." : "Save header settings"}
              </Button>
            </div>
          </div>
        )
      ) : null}

      {activeTab === "announcement" ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={openCreateAnnouncement}>
              <Plus size={16} className="mr-2 inline" />
              Add announcement
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            {barsLoading ? (
              <div className="p-8 text-sm text-zinc-500">
                Loading announcement bars...
              </div>
            ) : bars.length === 0 ? (
              <div className="p-8 text-sm text-zinc-500">No announcement bars yet.</div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {bars.map((bar) => (
                  <div
                    key={bar.id}
                    className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: bar.backgroundColor,
                            color: bar.textColor,
                          }}
                        >
                          Preview
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            bar.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {bar.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="text-xs text-zinc-500">
                          Priority {bar.priority}
                        </span>
                      </div>
                      <p className="font-medium text-zinc-900">{bar.message}</p>
                      {bar.linkText && bar.linkUrl ? (
                        <p className="text-sm text-zinc-500">
                          {bar.linkText} → {bar.linkUrl}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => openEditAnnouncement(bar)}>
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => deleteAnnouncement(bar.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {activeTab === "navigation" ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={openCreateMenu}>
              <Plus size={16} className="mr-2 inline" />
              Add menu
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Menus
              </h2>
              {navLoading ? (
                <p className="text-sm text-zinc-500">Loading...</p>
              ) : menus.length === 0 ? (
                <p className="text-sm text-zinc-500">No menus yet.</p>
              ) : (
                <div className="space-y-2">
                  {menus.map((menu) => (
                    <button
                      key={menu.id}
                      type="button"
                      onClick={() => setSelectedMenuId(menu.id)}
                      className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                        selectedMenuId === menu.id
                          ? "border-admin-primary bg-admin-primary/5"
                          : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <p className="font-medium text-zinc-900">{menu.name}</p>
                      <p className="text-xs text-zinc-500">{menu.slug}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              {!selectedMenu ? (
                <div className="p-8 text-sm text-zinc-500">
                  Select a menu to manage items.
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 p-4">
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-900">
                        {selectedMenu.name}
                      </h2>
                      <p className="text-sm text-zinc-500">
                        {selectedMenu.items.length} items
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => openEditMenu(selectedMenu)}>
                        Edit menu
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => deleteMenu(selectedMenu.id)}
                      >
                        Delete menu
                      </Button>
                      <Button onClick={() => openCreateMenuItem()}>
                        <Plus size={16} className="mr-1 inline" />
                        Add item
                      </Button>
                    </div>
                  </div>

                  {topLevelItems.length === 0 ? (
                    <div className="p-8 text-sm text-zinc-500">No menu items yet.</div>
                  ) : (
                    topLevelItems.map((item) => renderMenuItemRow(item))
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 p-5">
          <h2 className="text-lg font-semibold text-zinc-900">Header Preview</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Live preview matching the website header layout.
          </p>
        </div>
        <div className="p-5">
          <HeaderPreviewContent data={headerPreviewData} />
        </div>
      </div>

      {announcementModalOpen ? (
        <AdminModal
          onClose={() => setAnnouncementModalOpen(false)}
          title={
            announcementForm.id ? "Edit announcement bar" : "Add announcement bar"
          }
        >
          <div className="space-y-4">
            <label className="flex items-center gap-3 text-sm font-medium text-zinc-700">
              <input
                type="checkbox"
                checked={announcementForm.isActive}
                onChange={(event) =>
                  setAnnouncementForm((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
              />
              Active
            </label>
            <Input
              label="Message"
              required
              value={announcementForm.message}
              onChange={(event) =>
                setAnnouncementForm((current) => ({
                  ...current,
                  message: event.target.value,
                }))
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Link text"
                value={announcementForm.linkText}
                onChange={(event) =>
                  setAnnouncementForm((current) => ({
                    ...current,
                    linkText: event.target.value,
                  }))
                }
              />
              <Input
                label="Link URL"
                value={announcementForm.linkUrl}
                onChange={(event) =>
                  setAnnouncementForm((current) => ({
                    ...current,
                    linkUrl: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Background color"
                type="color"
                value={announcementForm.backgroundColor}
                onChange={(event) =>
                  setAnnouncementForm((current) => ({
                    ...current,
                    backgroundColor: event.target.value,
                  }))
                }
              />
              <Input
                label="Text color"
                type="color"
                value={announcementForm.textColor}
                onChange={(event) =>
                  setAnnouncementForm((current) => ({
                    ...current,
                    textColor: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Start date"
                type="datetime-local"
                value={announcementForm.startDate}
                onChange={(event) =>
                  setAnnouncementForm((current) => ({
                    ...current,
                    startDate: event.target.value,
                  }))
                }
              />
              <Input
                label="End date"
                type="datetime-local"
                value={announcementForm.endDate}
                onChange={(event) =>
                  setAnnouncementForm((current) => ({
                    ...current,
                    endDate: event.target.value,
                  }))
                }
              />
            </div>
            <Input
              label="Priority"
              type="number"
              value={String(announcementForm.priority)}
              onChange={(event) =>
                setAnnouncementForm((current) => ({
                  ...current,
                  priority: Number(event.target.value) || 0,
                }))
              }
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setAnnouncementModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveAnnouncement} disabled={announcementSaving}>
                {announcementSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </AdminModal>
      ) : null}

      {menuModalOpen ? (
        <AdminModal
          onClose={() => setMenuModalOpen(false)}
          title={menuForm.id ? "Edit menu" : "Add menu"}
        >
          <div className="space-y-4">
            <Input
              label="Name"
              value={menuForm.name}
              onChange={(event) =>
                setMenuForm((current) => ({ ...current, name: event.target.value }))
              }
            />
            <Input
              label="Slug"
              value={menuForm.slug}
              onChange={(event) =>
                setMenuForm((current) => ({
                  ...current,
                  slug: event.target.value.toLowerCase().replace(/\s+/g, "-"),
                }))
              }
            />
            <label className="flex items-center gap-3 text-sm font-medium text-zinc-700">
              <input
                type="checkbox"
                checked={menuForm.isActive}
                onChange={(event) =>
                  setMenuForm((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
              />
              Active
            </label>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setMenuModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveMenu} disabled={navSaving}>
                {navSaving ? "Saving..." : "Save menu"}
              </Button>
            </div>
          </div>
        </AdminModal>
      ) : null}

      {itemModalOpen && itemForm ? (
        <AdminModal
          onClose={() => setItemModalOpen(false)}
          title={itemForm.id ? "Edit menu item" : "Add menu item"}
        >
          <div className="space-y-4">
            <FormDropdown
              label="Parent item"
              value={itemForm.parentId === "" ? "" : String(itemForm.parentId)}
              options={[{ value: "", label: "Top level" }, ...parentOptions]}
              onChange={(value) =>
                setItemForm((current) =>
                  current
                    ? { ...current, parentId: value ? Number(value) : "" }
                    : current
                )
              }
            />
            <Input
              label="Label"
              value={itemForm.label}
              onChange={(event) =>
                setItemForm((current) =>
                  current ? { ...current, label: event.target.value } : current
                )
              }
            />
            <Input
              label="URL"
              value={itemForm.url}
              onChange={(event) =>
                setItemForm((current) =>
                  current ? { ...current, url: event.target.value } : current
                )
              }
            />
            <Input
              label="Sort order"
              type="number"
              value={String(itemForm.sortOrder)}
              onChange={(event) =>
                setItemForm((current) =>
                  current
                    ? { ...current, sortOrder: Number(event.target.value) || 0 }
                    : current
                )
              }
            />
            <label className="flex items-center gap-3 text-sm font-medium text-zinc-700">
              <input
                type="checkbox"
                checked={itemForm.isActive}
                onChange={(event) =>
                  setItemForm((current) =>
                    current ? { ...current, isActive: event.target.checked } : current
                  )
                }
              />
              Active
            </label>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setItemModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveMenuItem} disabled={navSaving}>
                {navSaving ? "Saving..." : "Save item"}
              </Button>
            </div>
          </div>
        </AdminModal>
      ) : null}
    </div>
  );
}
