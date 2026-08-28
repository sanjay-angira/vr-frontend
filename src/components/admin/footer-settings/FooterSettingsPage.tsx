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
import { useDeleteConfirmation } from "@/components/admin/shared/useDeleteConfirmation";
import { FormDropdown } from "@/components/admin/forms/shared/FormDropdown";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { deleteData, getData, postData, putData } from "@/services/api/apiService";
import type { AdminFooterLinkRow, AdminFooterSection } from "@/types/footer";

function unwrap<T>(response: { data?: T } | T): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data?: T }).data as T;
  }
  return response as T;
}

type FooterSection = AdminFooterSection;
type FooterLinkRow = AdminFooterLinkRow;

type LinkFormState = {
  id?: number | null;
  label: string;
  url: string;
  position: number;
  sectionId: number | "";
  status: boolean;
};

const emptyLinkForm = (): LinkFormState => ({
  id: null,
  label: "",
  url: "",
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
}: {
  rows: FooterLinkRow[];
  onEdit: (row: FooterLinkRow) => void;
  onDelete: (row: FooterLinkRow) => void;
  onToggleStatus: (row: FooterLinkRow, status: boolean) => void;
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
            <th className="px-3 py-2">Label</th>
            <th className="px-3 py-2">URL</th>
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
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [items, setItems] = useState<FooterLinkRow[]>([]);
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

  const sectionDelete = useDeleteConfirmation<FooterSection>({
    onConfirm: async (section) => {
      try {
        await deleteData(API_ENDPOINTS.FOOTER.SECTION_BY_ID(section.id));
        await loadAll();
      } catch {
        setMessage("Failed to delete section.");
      }
    },
    getMessage: (section) =>
      `Are you sure you want to delete section "${section.title}"? This action cannot be undone.`,
  });

  const footerItemDelete = useDeleteConfirmation<FooterLinkRow>({
    onConfirm: async (row) => {
      try {
        await deleteData(API_ENDPOINTS.FOOTER.ITEM_BY_ID(row.id));
        await loadAll();
      } catch {
        setMessage("Failed to delete footer item.");
      }
    },
    getMessage: (row) =>
      `Are you sure you want to delete "${row.label}"? This action cannot be undone.`,
  });

  const menuSection = useMemo(
    () => sections.find((section) => section.type === "menu" || !section.type),
    [sections]
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sectionsRes, itemsRes] = await Promise.all([
        getData(API_ENDPOINTS.FOOTER.SECTIONS),
        getData(API_ENDPOINTS.FOOTER.ITEMS),
      ]);

      const sectionsData = unwrap<FooterSection[]>(sectionsRes);
      const itemsData = unwrap<{ rows?: FooterLinkRow[] } | FooterLinkRow[]>(itemsRes);

      setSections(
        Array.isArray(sectionsData)
          ? [...sectionsData].sort((a, b) => a.position - b.position)
          : []
      );
      setItems(Array.isArray(itemsData) ? itemsData : (itemsData?.rows ?? []));
    } catch {
      setMessage("Failed to load footer data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

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
          type: "menu",
          position: sectionForm.position ?? sections.length + 1,
          status: sectionForm.status,
        });
      } else if (sectionForm.id) {
        await putData(API_ENDPOINTS.FOOTER.SECTION_BY_ID(sectionForm.id), {
          title: sectionForm.title,
          type: "menu",
          status: sectionForm.status,
        });
      }
      setSectionModal(null);
      await loadAll();
    } catch {
      setMessage("Failed to save footer section.");
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

  async function saveItem() {
    if (!itemForm.label.trim() || !itemForm.sectionId) return;

    const payload = {
      label: itemForm.label,
      url: itemForm.url,
      position: itemForm.position || 1,
      sectionId: Number(itemForm.sectionId),
      status: itemForm.status,
    };

    try {
      if (itemModal === "create") {
        await postData(API_ENDPOINTS.FOOTER.ITEMS, payload);
      } else if (itemForm.id) {
        await putData(API_ENDPOINTS.FOOTER.ITEM_BY_ID(itemForm.id), payload);
      }
      setItemModal(null);
      await loadAll();
    } catch {
      setMessage("Failed to save footer item.");
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
          Manage footer columns and links. Contact, social, and payment chrome are fixed on the storefront.
        </p>
        {message && (
          <p className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
            {message}
          </p>
        )}
      </div>

      <AdminCard
        title="Footer Sections"
        description="Create columns and reorder them. These appear as link lists on the storefront."
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
                      <span className="mt-2 inline-flex rounded-full bg-admin-primary/10 px-2 py-0.5 text-xs text-admin-primary">
                        Position {section.position}
                      </span>
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
                      onClick={() => sectionDelete.requestDelete(section)}
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

      <AdminCard
        title="Footer Items"
        description="Links shown under each footer column."
        action={
          <Button
            type="button"
            disabled={!menuSection}
            onClick={() => {
              setItemForm({
                ...emptyLinkForm(),
                sectionId: menuSection?.id ?? "",
                position: items.length + 1,
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
          rows={items}
          onEdit={(row) => {
            setItemForm({
              id: row.id,
              label: row.label,
              url: row.url ?? "",
              position: row.position ?? 1,
              sectionId: row.sectionId ?? row.section?.id ?? "",
              status: Boolean(row.status),
            });
            setItemModal("edit");
          }}
          onDelete={(row) => footerItemDelete.requestDelete(row)}
          onToggleStatus={async (row, status) => {
            await putData(API_ENDPOINTS.FOOTER.ITEM_BY_ID(row.id), { status });
            await loadAll();
          }}
        />
      </AdminCard>

      {sectionModal && (
        <AdminModal
          title={sectionModal === "create" ? "Add Footer Section" : "Edit Footer Section"}
          description="Set the column title and visibility for your footer."
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
              placeholder="e.g. Information"
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
          description="Add a link to a footer column."
          bodyClassName="overflow-visible"
          onClose={() => setItemModal(null)}
          onSubmit={saveItem}
          submitLabel={itemModal === "create" ? "Create Item" : "Update Item"}
        >
          <div className="space-y-5">
            <FormDropdown
              label="Section"
              required
              value={itemForm.sectionId === "" ? "" : itemForm.sectionId}
              onChange={(value) =>
                setItemForm({ ...itemForm, sectionId: value ? Number(value) : "" })
              }
              options={sections.map((section) => ({
                label: section.title,
                value: section.id,
              }))}
              placeholder="Select section"
            />
            <Input
              label="Label"
              required
              value={itemForm.label}
              onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })}
            />
            <Input
              label="URL"
              value={itemForm.url}
              onChange={(e) => setItemForm({ ...itemForm, url: e.target.value })}
            />
            <Input
              label="Position"
              type="number"
              value={String(itemForm.position || "")}
              onChange={(e) =>
                setItemForm({ ...itemForm, position: Number(e.target.value) || 0 })
              }
            />
            <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
              <span className="text-sm font-medium text-zinc-700">Active</span>
              <Toggle
                inline
                label=""
                checked={itemForm.status}
                onChange={(status) => setItemForm({ ...itemForm, status })}
              />
            </div>
          </div>
        </AdminModal>
      )}

      {sectionDelete.modal}
      {footerItemDelete.modal}
    </div>
  );
}
