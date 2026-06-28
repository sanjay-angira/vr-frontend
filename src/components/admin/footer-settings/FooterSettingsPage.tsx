"use client";

import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { AdminModal } from "@/components/admin/shared/AdminModal";
import { FormDropdown } from "@/components/admin/forms/shared/FormDropdown";
import { ImageUploadField } from "@/components/admin/forms/shared/ImageUploadField";
import { UPLOAD_PATHS } from "@/components/admin/forms/shared/uploadPaths";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { deleteData, getData, postData, putData } from "@/services/api/apiService";
import { buildFooterPreviewData } from "@/components/admin/footer-settings/buildFooterPreviewData";
import { WebsiteFooterView } from "@/components/common/WebsiteFooterView";
import "@/styles/website/footer-preview.css";

function unwrap<T>(response: { data?: T } | T): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data?: T }).data as T;
  }
  return response as T;
}

type FooterSettings = {
  id?: number;
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

const SECTION_TYPES = [
  { value: "menu", label: "Menu" },
  { value: "contact", label: "Contact" },
  { value: "social", label: "Social" },
  { value: "payment", label: "Payment" },
];

type LinkFormState = {
  id?: number | null;
  label: string;
  url: string;
  icon: string;
  position: number;
  sectionId: number | "";
  status: boolean;
};

const emptyLinkForm = (): LinkFormState => ({
  id: null,
  label: "",
  url: "",
  icon: "",
  position: 0,
  sectionId: "",
  status: true,
});

function Toggle({
  checked,
  onChange,
  label,
  inline = false,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  inline?: boolean;
}) {
  const switchButton = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label || (checked ? "Active" : "Inactive")}
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
  );

  if (inline) {
    return (
      <div className="inline-flex items-center gap-2">
        {label ? <span className="text-sm text-zinc-600">{label}</span> : null}
        {switchButton}
      </div>
    );
  }

  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      {switchButton}
    </label>
  );
}

function AdminCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm ${className ?? ""}`}
    >
      <div className="flex flex-col gap-3 border-b border-zinc-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
          {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function LinkTable({
  rows,
  onEdit,
  onDelete,
  onToggleStatus,
  nameColumn = "Label",
}: {
  rows: FooterLinkRow[];
  onEdit: (row: FooterLinkRow) => void;
  onDelete: (row: FooterLinkRow) => void;
  onToggleStatus: (row: FooterLinkRow, status: boolean) => void;
  nameColumn?: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500">No records yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">{nameColumn}</th>
            <th className="px-3 py-2">URL</th>
            <th className="px-3 py-2">Icon</th>
            <th className="px-3 py-2">Position</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
              <td className="px-3 py-3">{row.id}</td>
              <td className="px-3 py-3 font-medium text-zinc-900">{row.label}</td>
              <td className="max-w-[180px] truncate px-3 py-3 text-zinc-600">{row.url}</td>
              <td className="px-3 py-3">
                {row.icon ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={resolveImageUrl(row.icon)}
                    alt=""
                    className="h-8 w-8 rounded object-contain"
                  />
                ) : (
                  "—"
                )}
              </td>
              <td className="px-3 py-3">{row.position ?? "—"}</td>
              <td className="px-3 py-3">
                <Toggle
                  inline
                  label=""
                  checked={Boolean(row.status)}
                  onChange={(status) => onToggleStatus(row, status)}
                />
              </td>
              <td className="px-3 py-3">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(row)}
                    className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-admin-primary"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(row)}
                    className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FooterSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settings, setSettings] = useState<FooterSettings>({ status: true });
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [items, setItems] = useState<FooterLinkRow[]>([]);
  const [socialLinks, setSocialLinks] = useState<FooterLinkRow[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<FooterLinkRow[]>([]);
  const [message, setMessage] = useState("");

  const [sectionModal, setSectionModal] = useState<"create" | "edit" | null>(null);
  const [sectionForm, setSectionForm] = useState<Partial<FooterSection>>({
    title: "",
    type: "menu",
    position: 1,
    status: true,
  });

  const [itemModal, setItemModal] = useState<"create" | "edit" | null>(null);
  const [itemForm, setItemForm] = useState<LinkFormState>(emptyLinkForm());

  const [socialModal, setSocialModal] = useState<"create" | "edit" | null>(null);
  const [socialForm, setSocialForm] = useState<LinkFormState>(emptyLinkForm());

  const [paymentModal, setPaymentModal] = useState<"create" | "edit" | null>(null);
  const [paymentForm, setPaymentForm] = useState<LinkFormState>(emptyLinkForm());

  const menuSection = useMemo(
    () => sections.find((section) => section.type === "menu"),
    [sections]
  );

  const footerItems = useMemo(
    () => items.filter((item) => item.section?.type === "menu"),
    [items]
  );

  const footerPreviewData = useMemo(
    () =>
      buildFooterPreviewData(
        settings,
        sections,
        items,
        socialLinks,
        paymentMethods
      ),
    [settings, sections, items, socialLinks, paymentMethods]
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, sectionsRes, itemsRes, socialRes, paymentRes] =
        await Promise.all([
          getData(API_ENDPOINTS.FOOTER.SETTINGS),
          getData(API_ENDPOINTS.FOOTER.SECTIONS),
          getData(API_ENDPOINTS.FOOTER.ITEMS),
          getData(API_ENDPOINTS.FOOTER.SOCIAL_LINKS),
          getData(API_ENDPOINTS.FOOTER.PAYMENT_METHODS),
        ]);

      const settingsData = unwrap<FooterSettings>(settingsRes) ?? { status: true };
      const sectionsData = unwrap<FooterSection[]>(sectionsRes);
      const itemsData = unwrap<{ rows?: FooterLinkRow[] } | FooterLinkRow[]>(itemsRes);
      const socialData = unwrap<{ rows?: FooterLinkRow[] } | FooterLinkRow[]>(socialRes);
      const paymentData = unwrap<{ rows?: FooterLinkRow[] } | FooterLinkRow[]>(paymentRes);

      setSettings(settingsData);
      setSections(
        Array.isArray(sectionsData)
          ? [...sectionsData].sort((a, b) => a.position - b.position)
          : []
      );
      setItems(Array.isArray(itemsData) ? itemsData : (itemsData?.rows ?? []));
      setSocialLinks(Array.isArray(socialData) ? socialData : (socialData?.rows ?? []));
      setPaymentMethods(
        Array.isArray(paymentData) ? paymentData : (paymentData?.rows ?? [])
      );
    } catch {
      setMessage("Failed to load footer data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  async function handleSaveSettings() {
    setSavingSettings(true);
    setMessage("");
    try {
      if (settings.id) {
        await putData(API_ENDPOINTS.FOOTER.SETTING_BY_ID(settings.id), settings);
      } else {
        await postData(API_ENDPOINTS.FOOTER.SETTINGS, settings);
      }
      await loadAll();
      setMessage("Footer settings saved.");
    } catch {
      setMessage("Failed to save footer settings.");
    } finally {
      setSavingSettings(false);
    }
  }

  async function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;

    const next = [...sections];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    const reordered = next.map((section, idx) => ({ ...section, position: idx + 1 }));
    setSections(reordered);

    try {
      await Promise.all(
        reordered.map((section) =>
          putData(API_ENDPOINTS.FOOTER.SECTION_BY_ID(section.id), {
            position: section.position,
          })
        )
      );
    } catch {
      setMessage("Failed to update section order.");
      void loadAll();
    }
  }

  async function handleSaveSection() {
    if (!sectionForm.title?.trim()) return;

    try {
      if (sectionModal === "create") {
        await postData(API_ENDPOINTS.FOOTER.SECTIONS, {
          title: sectionForm.title,
          type: sectionForm.type,
          position: sectionForm.position ?? sections.length + 1,
          status: sectionForm.status,
        });
      } else if (sectionForm.id) {
        await putData(API_ENDPOINTS.FOOTER.SECTION_BY_ID(sectionForm.id), {
          title: sectionForm.title,
          type: sectionForm.type,
          status: sectionForm.status,
        });
      }
      setSectionModal(null);
      await loadAll();
    } catch {
      setMessage("Failed to save footer section.");
    }
  }

  async function handleDeleteSection(section: FooterSection) {
    if (!confirm(`Delete section "${section.title}"?`)) return;
    try {
      await deleteData(API_ENDPOINTS.FOOTER.SECTION_BY_ID(section.id));
      await loadAll();
    } catch {
      setMessage("Failed to delete section.");
    }
  }

  async function handleToggleSection(section: FooterSection, status: boolean) {
    try {
      await putData(API_ENDPOINTS.FOOTER.SECTION_BY_ID(section.id), { status });
      await loadAll();
    } catch {
      setMessage("Failed to update section status.");
    }
  }

  async function saveLinkRow(
    mode: "create" | "edit" | null,
    form: LinkFormState,
    endpoints: { list: string; byId: (id: number) => string },
    close: () => void
  ) {
    if (!form.label.trim() || !form.sectionId) return;

    const payload = {
      label: form.label,
      url: form.url,
      icon: form.icon || "",
      position: form.position || 1,
      sectionId: Number(form.sectionId),
      status: form.status,
    };

    try {
      if (mode === "create") {
        await postData(endpoints.list, payload);
      } else if (form.id) {
        await putData(endpoints.byId(form.id), payload);
      }
      close();
      await loadAll();
    } catch {
      setMessage("Failed to save record.");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Footer Management</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage footer contact info, sections, links, and preview.
        </p>
        {message && (
          <p className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
            {message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <AdminCard title="Footer Settings" description="Global footer contact details.">
            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={settings.email ?? ""}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
              <Input
                label="Phone Number"
                value={settings.phone ?? ""}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Address</label>
                <textarea
                  rows={3}
                  value={settings.address ?? ""}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm focus:border-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/15"
                />
              </div>
              <Input
                label="Copyright Text"
                value={settings.copyrightText ?? ""}
                onChange={(e) =>
                  setSettings({ ...settings, copyrightText: e.target.value })
                }
              />
              <Toggle
                label="Active"
                checked={Boolean(settings.status ?? true)}
                onChange={(status) => setSettings({ ...settings, status })}
              />
              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveSettings} disabled={savingSettings}>
                  {savingSettings ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </AdminCard>
        </div>

        <div className="xl:col-span-7">
          <AdminCard
            title="Footer Sections"
            description="Create sections and reorder them."
            action={
              <Button
                type="button"
                onClick={() => {
                  setSectionForm({
                    title: "",
                    type: "menu",
                    position: sections.length + 1,
                    status: true,
                  });
                  setSectionModal("create");
                }}
              >
                <Plus className="h-4 w-4" />
                Add Section
              </Button>
            }
          >
            {sections.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">No footer sections yet.</p>
            ) : (
              <div className="space-y-3">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="rounded-lg border border-zinc-200 p-4 transition-colors hover:border-admin-primary/30"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-3">
                        <GripVertical className="mt-1 h-4 w-4 text-zinc-400" />
                        <div>
                          <p className="font-semibold text-zinc-900">{section.title}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                              {section.type}
                            </span>
                            <span className="rounded-full bg-admin-primary/10 px-2 py-0.5 text-xs text-admin-primary">
                              Position {section.position}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => moveSection(index, -1)}
                          disabled={index === 0}
                          className="rounded-lg border border-zinc-200 p-2 disabled:opacity-40"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection(index, 1)}
                          disabled={index === sections.length - 1}
                          className="rounded-lg border border-zinc-200 p-2 disabled:opacity-40"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <Toggle
                          inline
                          label="Visible"
                          checked={Boolean(section.status)}
                          onChange={(status) => handleToggleSection(section, status)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSectionForm({ ...section });
                            setSectionModal("edit");
                          }}
                          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(section)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminCard
          title="Footer Items"
          description="Information links shown in the footer."
          action={
            <Button
              type="button"
              disabled={!menuSection}
              onClick={() => {
                setItemForm({
                  ...emptyLinkForm(),
                  sectionId: menuSection?.id ?? "",
                  position: footerItems.length + 1,
                });
                setItemModal("create");
              }}
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          }
        >
          <LinkTable
            rows={footerItems}
            onEdit={(row) => {
              setItemForm({
                id: row.id,
                label: row.label,
                url: row.url ?? "",
                icon: row.icon ?? "",
                position: row.position ?? 1,
                sectionId: row.sectionId ?? row.section?.id ?? "",
                status: Boolean(row.status),
              });
              setItemModal("edit");
            }}
            onDelete={async (row) => {
              if (!confirm("Delete this footer item?")) return;
              await deleteData(API_ENDPOINTS.FOOTER.ITEM_BY_ID(row.id));
              await loadAll();
            }}
            onToggleStatus={async (row, status) => {
              await putData(API_ENDPOINTS.FOOTER.ITEM_BY_ID(row.id), { status });
              await loadAll();
            }}
          />
        </AdminCard>

        <AdminCard
          title="Social Links"
          description="Social platform links for the footer."
          action={
            <Button
              type="button"
              onClick={() => {
                setSocialForm({
                  ...emptyLinkForm(),
                  position: socialLinks.length + 1,
                  sectionId: sections.find((s) => s.type === "social")?.id ?? "",
                });
                setSocialModal("create");
              }}
            >
              <Plus className="h-4 w-4" />
              Add Link
            </Button>
          }
        >
          <LinkTable
            rows={socialLinks}
            nameColumn="Platform"
            onEdit={(row) => {
              setSocialForm({
                id: row.id,
                label: row.label,
                url: row.url ?? "",
                icon: row.icon ?? "",
                position: row.position ?? 1,
                sectionId: row.sectionId ?? "",
                status: Boolean(row.status),
              });
              setSocialModal("edit");
            }}
            onDelete={async (row) => {
              if (!confirm("Delete this social link?")) return;
              await deleteData(API_ENDPOINTS.FOOTER.SOCIAL_LINK_BY_ID(row.id));
              await loadAll();
            }}
            onToggleStatus={async (row, status) => {
              await putData(API_ENDPOINTS.FOOTER.SOCIAL_LINK_BY_ID(row.id), { status });
              await loadAll();
            }}
          />
        </AdminCard>
      </div>

      <AdminCard
        title="Payment Methods"
        description="Payment badges shown in the footer."
        action={
          <Button
            type="button"
            onClick={() => {
              setPaymentForm({
                ...emptyLinkForm(),
                position: paymentMethods.length + 1,
                sectionId: sections.find((s) => s.type === "payment")?.id ?? "",
              });
              setPaymentModal("create");
            }}
          >
            <Plus className="h-4 w-4" />
            Add Method
          </Button>
        }
      >
        <LinkTable
          rows={paymentMethods}
          nameColumn="Method"
          onEdit={(row) => {
            setPaymentForm({
              id: row.id,
              label: row.label,
              url: row.url ?? "",
              icon: row.icon ?? "",
              position: row.position ?? 1,
              sectionId: row.sectionId ?? "",
              status: Boolean(row.status),
            });
            setPaymentModal("edit");
          }}
          onDelete={async (row) => {
            if (!confirm("Delete this payment method?")) return;
            await deleteData(API_ENDPOINTS.FOOTER.PAYMENT_METHOD_BY_ID(row.id));
            await loadAll();
          }}
          onToggleStatus={async (row, status) => {
            await putData(API_ENDPOINTS.FOOTER.PAYMENT_METHOD_BY_ID(row.id), { status });
            await loadAll();
          }}
        />
      </AdminCard>

      <AdminCard title="Footer Preview" description="Live preview matching the website footer layout.">
        <div className="website-footer-preview border border-zinc-200">
          <WebsiteFooterView data={footerPreviewData} isPreview />
        </div>
      </AdminCard>

      {sectionModal && (
        <AdminModal
          title={sectionModal === "create" ? "Add Footer Section" : "Edit Footer Section"}
          description="Set the section title, type, and visibility for your footer."
          bodyClassName="overflow-visible"
          onClose={() => setSectionModal(null)}
          onSubmit={handleSaveSection}
          submitLabel={sectionModal === "create" ? "Create Section" : "Update Section"}
        >
          <div className="space-y-5">
            <Input
              label="Section Title"
              required
              value={sectionForm.title ?? ""}
              onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
              placeholder="e.g. Quick Links"
            />
            <FormDropdown
              label="Section Type"
              required
              value={sectionForm.type ?? "menu"}
              onChange={(value) => setSectionForm({ ...sectionForm, type: value })}
              options={SECTION_TYPES}
              placeholder="Select section type"
            />
            <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
              <span className="text-sm font-medium text-zinc-700">Visible on storefront</span>
              <Toggle
                inline
                label=""
                checked={Boolean(sectionForm.status)}
                onChange={(status) => setSectionForm({ ...sectionForm, status })}
              />
            </div>
          </div>
        </AdminModal>
      )}

      {itemModal && (
        <AdminModal
          title={itemModal === "create" ? "Add Footer Item" : "Edit Footer Item"}
          description="Add a link to a menu section in your footer."
          bodyClassName="overflow-visible"
          onClose={() => setItemModal(null)}
          onSubmit={() =>
            saveLinkRow(
              itemModal,
              itemForm,
              {
                list: API_ENDPOINTS.FOOTER.ITEMS,
                byId: API_ENDPOINTS.FOOTER.ITEM_BY_ID,
              },
              () => setItemModal(null)
            )
          }
          submitLabel={itemModal === "create" ? "Create Item" : "Update Item"}
        >
          <LinkFormFields
            form={itemForm}
            setForm={setItemForm}
            sections={sections.filter((s) => s.type === "menu")}
          />
        </AdminModal>
      )}

      {socialModal && (
        <AdminModal
          title={socialModal === "create" ? "Add Social Link" : "Edit Social Link"}
          description="Add a social profile link to your footer."
          bodyClassName="overflow-visible"
          onClose={() => setSocialModal(null)}
          onSubmit={() =>
            saveLinkRow(
              socialModal,
              socialForm,
              {
                list: API_ENDPOINTS.FOOTER.SOCIAL_LINKS,
                byId: API_ENDPOINTS.FOOTER.SOCIAL_LINK_BY_ID,
              },
              () => setSocialModal(null)
            )
          }
          submitLabel={socialModal === "create" ? "Create Link" : "Update Link"}
        >
          <LinkFormFields
            form={socialForm}
            setForm={setSocialForm}
            sections={sections.filter((s) => s.type === "social" || s.type === "contact")}
            labelField="Platform"
          />
        </AdminModal>
      )}

      {paymentModal && (
        <AdminModal
          title={paymentModal === "create" ? "Add Payment Method" : "Edit Payment Method"}
          description="Add a payment method icon or label to your footer."
          bodyClassName="overflow-visible"
          onClose={() => setPaymentModal(null)}
          onSubmit={() =>
            saveLinkRow(
              paymentModal,
              paymentForm,
              {
                list: API_ENDPOINTS.FOOTER.PAYMENT_METHODS,
                byId: API_ENDPOINTS.FOOTER.PAYMENT_METHOD_BY_ID,
              },
              () => setPaymentModal(null)
            )
          }
          submitLabel={paymentModal === "create" ? "Create Method" : "Update Method"}
        >
          <LinkFormFields
            form={paymentForm}
            setForm={setPaymentForm}
            sections={sections.filter((s) => s.type === "payment")}
            labelField="Method Label"
          />
        </AdminModal>
      )}
    </div>
  );
}

function LinkFormFields({
  form,
  setForm,
  sections,
  labelField = "Label",
}: {
  form: LinkFormState;
  setForm: (form: LinkFormState) => void;
  sections: FooterSection[];
  labelField?: string;
}) {
  return (
    <div className="space-y-5">
      <FormDropdown
        label="Section"
        required
        value={form.sectionId === "" ? "" : form.sectionId}
        onChange={(value) =>
          setForm({ ...form, sectionId: value ? Number(value) : "" })
        }
        options={sections.map((section) => ({
          label: section.title,
          value: section.id,
        }))}
        placeholder="Select section"
      />
      <Input
        label={labelField}
        required
        value={form.label}
        onChange={(e) => setForm({ ...form, label: e.target.value })}
      />
      <Input
        label="URL"
        value={form.url}
        onChange={(e) => setForm({ ...form, url: e.target.value })}
      />
      <ImageUploadField
        label="Icon"
        value={form.icon}
        onChange={(icon) => setForm({ ...form, icon })}
        uploadPath={UPLOAD_PATHS.footer.icons}
      />
      <Input
        label="Position"
        type="number"
        value={String(form.position || "")}
        onChange={(e) => setForm({ ...form, position: Number(e.target.value) || 0 })}
      />
      <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
        <span className="text-sm font-medium text-zinc-700">Active</span>
        <Toggle
          inline
          label=""
          checked={form.status}
          onChange={(status) => setForm({ ...form, status })}
        />
      </div>
    </div>
  );
}
