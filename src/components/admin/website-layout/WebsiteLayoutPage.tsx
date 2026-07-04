"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  GripVertical,
  LayoutTemplate,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { useDeleteConfirmation } from "@/components/admin/shared/useDeleteConfirmation";
import { deleteData, getData, putData } from "@/services/api/apiService";

function unwrap<T>(response: { data?: T } | T): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data?: T }).data as T;
  }
  return response as T;
}

type CmsSection = {
  id: number | string;
  title: string;
  type: string;
  status: boolean;
  position: number;
  data?: Record<string, unknown>;
  products?: Array<{ id: number }>;
  categories?: Array<{ id: number }>;
  blogs?: Array<{ id: number }>;
  offers?: Array<{ id: number }>;
  faqs?: Array<{ id: number }>;
  banners?: Array<{ id: number }>;
  reviews?: Array<{ id: number }>;
};

const SECTION_ICONS: Record<string, string> = {
  hero_banner: "🎨",
  category_slider: "📁",
  blog_section: "⚡",
  review_section: "⭐",
  faq_section: "🏆",
  offer_banner: "🎁",
  custom: "✨",
  product_slider: "🏢",
  news_letter: "📧",
  featured_products: "📦",
  flash_sale: "⚡",
  top_selling: "🔥",
  new_arrivals: "🆕",
  brand_logos: "🏷️",
  newsletter: "📧",
};

function getSectionIcon(type: string) {
  return SECTION_ICONS[type] ?? "📦";
}

function getSectionApiTag(type: string) {
  return type === "hero_banner" ? "hero_slider" : type;
}

function getSectionKey(section: CmsSection) {
  return String(section.id);
}

type SortableSectionRowProps = {
  section: CmsSection;
  index: number;
  total: number;
  reordering: boolean;
  onMove: (index: number, direction: -1 | 1) => void;
  onToggleVisibility: (section: CmsSection) => void;
  onDelete: (section: CmsSection) => void;
};

function SortableSectionRow({
  section,
  index,
  total,
  reordering,
  onMove,
  onToggleVisibility,
  onDelete,
}: SortableSectionRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: getSectionKey(section) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col gap-4 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${
        isDragging
          ? "z-10 bg-white shadow-md ring-1 ring-admin-primary/20"
          : "hover:bg-admin-primary/5"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          disabled={reordering}
          className="cursor-grab touch-none rounded p-1 text-zinc-400 hover:text-zinc-600 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Drag to reorder ${section.title}`}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sm text-white">
          {getSectionIcon(section.type)}
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-medium text-zinc-900">{section.title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-500">{section.type}</span>
            <span className="rounded-full bg-admin-primary/10 px-2 py-0.5 text-xs text-admin-primary">
              {getSectionApiTag(section.type)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onMove(index, -1)}
          disabled={index === 0 || reordering}
          className="rounded-lg border border-zinc-200 p-2 disabled:opacity-40"
          aria-label="Move section up"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onMove(index, 1)}
          disabled={index === total - 1 || reordering}
          className="rounded-lg border border-zinc-200 p-2 disabled:opacity-40"
          aria-label="Move section down"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onToggleVisibility(section)}
          disabled={reordering}
          className={`rounded-lg p-2 disabled:opacity-40 ${
            section.status
              ? "text-admin-primary hover:bg-admin-primary/10"
              : "text-zinc-400 hover:bg-zinc-100"
          }`}
          aria-label={section.status ? "Hide section" : "Show section"}
        >
          {section.status ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
        <Link
          href={`/admin/website-layout/modify/${section.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-admin-border bg-white px-4 py-2.5 text-sm font-medium text-blue-950 transition-colors hover:bg-admin-muted"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
        <button
          type="button"
          onClick={() => onDelete(section)}
          disabled={reordering}
          className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-40"
          aria-label="Delete section"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function WebsiteLayoutPage() {
  const [sections, setSections] = useState<CmsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
  const [message, setMessage] = useState("");

  const sectionDelete = useDeleteConfirmation<CmsSection>({
    onConfirm: async (section) => {
      try {
        await deleteData(API_ENDPOINTS.CMS_SECTIONS.DELETE(section.id));
        await loadSections();
      } catch {
        setMessage("Failed to delete section.");
      }
    },
    getMessage: (section) =>
      `Are you sure you want to delete section "${section.title}"? This action cannot be undone.`,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadSections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getData(API_ENDPOINTS.CMS_SECTIONS.LIST);
      const data = unwrap<CmsSection[]>(res);
      const list = Array.isArray(data) ? data : [];
      setSections(
        [...list].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      );
    } catch {
      setMessage("Failed to load homepage sections.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSections();
  }, [loadSections]);

  async function persistOrder(next: CmsSection[]) {
    setReordering(true);
    setMessage("");
    try {
      await putData(API_ENDPOINTS.CMS_SECTIONS.REORDER, {
        sections: next.map((section, idx) => ({
          id: Number(section.id),
          position: idx + 1,
        })),
      });
      setSections(
        next.map((section, idx) => ({
          ...section,
          position: idx + 1,
        }))
      );
    } catch {
      setMessage("Failed to update section order.");
      void loadSections();
    } finally {
      setReordering(false);
    }
  }

  async function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    await persistOrder(arrayMove(sections, index, target));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex(
      (section) => getSectionKey(section) === active.id
    );
    const newIndex = sections.findIndex(
      (section) => getSectionKey(section) === over.id
    );

    if (oldIndex === -1 || newIndex === -1) return;

    void persistOrder(arrayMove(sections, oldIndex, newIndex));
  }

  async function toggleVisibility(section: CmsSection) {
    try {
      await putData(API_ENDPOINTS.CMS_SECTIONS.UPDATE(section.id), {
        title: section.title,
        type: section.type,
        position: section.position,
        status: !section.status,
        data: section.data,
      });
      await loadSections();
    } catch {
      setMessage("Failed to update section visibility.");
    }
  }

  function handleDelete(section: CmsSection) {
    sectionDelete.requestDelete(section);
  }

  const activeCount = sections.filter((section) => section.status).length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Homepage Builder</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Manage homepage sections, order, and visibility.
            </p>
          </div>
          <Link
            href="/admin/website-layout/add"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-admin-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-admin-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Add Section
          </Link>
        </div>
        {message && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Total Sections", value: sections.length, icon: LayoutTemplate },
          { label: "Active Sections", value: activeCount, icon: Eye },
          { label: "Inactive Sections", value: sections.length - activeCount, icon: EyeOff },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-zinc-900">{stat.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                <stat.icon className="h-5 w-5 text-zinc-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">Manage Homepage Sections</h2>
          {!loading && sections.length > 0 && (
            <p className="mt-1 text-sm text-zinc-500">
              Drag sections using the grip handle to reorder.
            </p>
          )}
        </div>

        {loading ? (
          <div className="space-y-0 p-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse border-b border-zinc-100 px-4 py-5">
                <div className="h-4 w-40 rounded bg-zinc-200" />
              </div>
            ))}
          </div>
        ) : sections.length === 0 ? (
          <p className="py-12 text-center text-sm text-zinc-500">No sections yet.</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map(getSectionKey)}
              strategy={verticalListSortingStrategy}
            >
              <div className="divide-y divide-zinc-100">
                {sections.map((section, index) => (
                  <SortableSectionRow
                    key={getSectionKey(section)}
                    section={section}
                    index={index}
                    total={sections.length}
                    reordering={reordering}
                    onMove={moveSection}
                    onToggleVisibility={toggleVisibility}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {sectionDelete.modal}
    </div>
  );
}
