"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FormDropdown } from "@/components/admin/forms/shared/FormDropdown";
import { DeleteConfirmationModal } from "@/components/admin/shared/DeleteConfirmationModal";
import { Button } from "@/components/common/Button";
import { getRowDisplayName } from "@/components/common/getRowDisplayName";

export type DataTableColumn<T extends object> = {
  key: string;
  header: string;
  cell?: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
};

export type DataTableAction = "add" | "view" | "edit" | "delete";

export type DataTableProps<T extends object> = {
  title?: string;
  description?: string;
  columns: DataTableColumn<T>[];
  data: T[];
  count?: number;
  actions?: DataTableAction[];
  addLabel?: string;
  emptyMessage?: string;
  getRowId?: (row: T, index: number) => string | number;
  onAdd?: () => void;
  addHref?: string;
  onView?: (row: T) => void;
  viewHref?: (row: T) => string;
  onEdit?: (row: T) => void;
  editHref?: (row: T) => string;
  onDelete?: (row: T) => void | Promise<void>;
  deleteConfirmTitle?: string;
  deleteConfirmMessage?: string | ((row: T) => string);
  /** Show search input. Default: true */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Controlled search value (server-side filtering) */
  searchValue?: string;
  /** Called when search changes. If set, parent handles filtering (no client-side filter). */
  onSearchChange?: (value: string) => void;
  /** Debounce ms for onSearchChange. Default: 400 */
  searchDebounceMs?: number;
  /** Column keys to search client-side. Defaults to all column keys. */
  searchKeys?: string[];
  isSearching?: boolean;
  /** Show loading state inside the table body while keeping toolbar and headers visible */
  isLoading?: boolean;
  /** Server-side pagination (1-based page number) */
  pageNumber?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};

function getNestedValue<T extends object>(row: T, key: string): unknown {
  return key.split(".").reduce<unknown>((value, part) => {
    if (value && typeof value === "object" && part in value) {
      return (value as Record<string, unknown>)[part];
    }
    return undefined;
  }, row);
}

function formatCellValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

function rowMatchesSearch<T extends object>(
  row: T,
  query: string,
  keys: string[]
): boolean {
  const term = query.trim().toLowerCase();
  if (!term) return true;

  return keys.some((key) => {
    const value = getNestedValue(row, key);
    if (value === null || value === undefined) return false;
    return String(value).toLowerCase().includes(term);
  });
}

function ActionIconButton({
  label,
  onClick,
  href,
  variant = "default",
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "danger";
  children: React.ReactNode;
}) {
  const className = `inline-flex items-center justify-center rounded-lg p-2 transition-colors ${
    variant === "danger"
      ? "text-red-600 hover:bg-red-50"
      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
  }`;

  if (href) {
    return (
      <Link href={href} aria-label={label} title={label} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  );
}

export function DataTable<T extends object>({
  columns,
  data,
  count,
  actions = [],
  addLabel = "Add new",
  emptyMessage = "No data found.",
  getRowId,
  onAdd,
  addHref,
  onView,
  viewHref,
  onEdit,
  editHref,
  onDelete,
  deleteConfirmTitle = "Confirm deletion",
  deleteConfirmMessage,
  searchable = true,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  searchDebounceMs = 400,
  searchKeys,
  isSearching = false,
  isLoading = false,
  pageNumber,
  pageSize,
  pageSizeOptions = [5, 10, 20, 50],
  onPageChange,
  onPageSizeChange,
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState("");
  const [pendingDeleteRow, setPendingDeleteRow] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isControlledSearch = searchValue !== undefined;
  const query = isControlledSearch ? searchValue : internalSearch;
  const isServerSearch = Boolean(onSearchChange);
  const keysToSearch = searchKeys ?? columns.map((column) => column.key);

  useEffect(() => {
    if (!onSearchChange || isControlledSearch) return;

    const timer = window.setTimeout(() => {
      onSearchChange(internalSearch);
    }, searchDebounceMs);

    return () => window.clearTimeout(timer);
  }, [internalSearch, onSearchChange, isControlledSearch, searchDebounceMs]);

  const filteredData = useMemo(() => {
    if (isServerSearch || !query.trim()) return data;
    return data.filter((row) => rowMatchesSearch(row, query, keysToSearch));
  }, [data, query, isServerSearch, keysToSearch]);

  const displayData = isServerSearch ? data : filteredData;
  const totalCount = count ?? data.length;
  const isPaginated = pageNumber !== undefined && pageSize !== undefined && Boolean(onPageChange);
  const totalPages = isPaginated ? Math.max(1, Math.ceil(totalCount / pageSize)) : 1;
  const rangeStart = isPaginated && totalCount > 0 ? (pageNumber - 1) * pageSize + 1 : 0;
  const rangeEnd = isPaginated
    ? Math.min(pageNumber * pageSize, totalCount)
    : displayData.length;
  const showAdd = actions.includes("add");
  const showView = actions.includes("view");
  const showEdit = actions.includes("edit");
  const showDelete = actions.includes("delete");
  const showRowActions = showView || showEdit || showDelete;
  const showToolbar = showAdd || searchable;
  const hasActiveSearch = Boolean(query.trim());
  const emptyText =
    hasActiveSearch && displayData.length === 0
      ? `No results for "${query.trim()}".`
      : emptyMessage;

  function handleSearchChange(value: string) {
    if (isControlledSearch) {
      onSearchChange?.(value);
      return;
    }

    setInternalSearch(value);
    if (onSearchChange) return;
  }

  function getDeleteMessage(row: T) {
    if (typeof deleteConfirmMessage === "function") {
      return deleteConfirmMessage(row);
    }

    if (typeof deleteConfirmMessage === "string") {
      return deleteConfirmMessage;
    }

    const label = getRowDisplayName(row);
    return label
      ? `Are you sure you want to delete "${label}"? This action cannot be undone.`
      : "Are you sure you want to delete this item? This action cannot be undone.";
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteRow || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(pendingDeleteRow);
      setPendingDeleteRow(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      {showToolbar && (
        <div className="flex flex-col gap-3 border-b border-zinc-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          {searchable ? (
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-9 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/15"
                aria-label="Search table"
              />
              {isSearching && (
                <span className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
              )}
            </div>
          ) : (
            <div className="min-w-0 flex-1" />
          )}

          {showAdd && (
            <div className="shrink-0">
              {addHref ? (
                <Link href={addHref}>
                  <Button>{addLabel}</Button>
                </Link>
              ) : (
                <Button onClick={onAdd}>{addLabel}</Button>
              )}
            </div>
          )}
        </div>
      )}

      {hasActiveSearch && (
        <p className="border-b border-zinc-50 px-5 py-2 text-xs text-zinc-500">
          Showing {displayData.length} of {totalCount} records
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/80 text-xs uppercase tracking-wide text-zinc-500">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-5 py-3 font-medium ${column.headerClassName ?? ""}`}
                >
                  {column.header}
                </th>
              ))}
              {showRowActions && (
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {isLoading && displayData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showRowActions ? 1 : 0)}
                  className="px-5 py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <span
                      className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700"
                      aria-hidden="true"
                    />
                    <p className="text-sm text-zinc-500">Loading...</p>
                  </div>
                </td>
              </tr>
            ) : displayData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showRowActions ? 1 : 0)}
                  className="px-5 py-12 text-center text-sm text-zinc-500"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              displayData.map((row, index) => {
                const rowId = getRowId?.(row, index) ?? index;

                return (
                  <tr
                    key={rowId}
                    className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/80"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-5 py-3.5 text-zinc-700 ${column.className ?? ""}`}
                      >
                        {column.cell
                          ? column.cell(row, index)
                          : formatCellValue(getNestedValue(row, column.key))}
                      </td>
                    ))}

                    {showRowActions && (
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {showView && (onView || viewHref) && (
                            <ActionIconButton
                              label="View"
                              onClick={onView ? () => onView(row) : undefined}
                              href={viewHref?.(row)}
                            >
                              <ViewIcon />
                            </ActionIconButton>
                          )}

                          {showEdit && (onEdit || editHref) && (
                            <ActionIconButton
                              label="Edit"
                              onClick={onEdit ? () => onEdit(row) : undefined}
                              href={editHref?.(row)}
                            >
                              <EditIcon />
                            </ActionIconButton>
                          )}

                          {showDelete && onDelete && (
                            <ActionIconButton
                              label="Delete"
                              variant="danger"
                              onClick={() => setPendingDeleteRow(row)}
                            >
                              <DeleteIcon />
                            </ActionIconButton>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isPaginated && (
        <div className="flex flex-col gap-3 border-t border-zinc-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500">
            {totalCount > 0
              ? `Showing ${rangeStart}–${rangeEnd} of ${totalCount} records`
              : "No records to show"}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {onPageSizeChange && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-600">Rows per page</span>
                <FormDropdown
                  label=""
                  value={pageSize}
                  onChange={(value) => onPageSizeChange(Number(value))}
                  options={pageSizeOptions.map((option) => ({
                    label: String(option),
                    value: option,
                  }))}
                  disabled={isLoading}
                  className="w-24"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange?.(pageNumber - 1)}
                disabled={pageNumber <= 1 || isLoading}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="min-w-24 text-center text-sm text-zinc-600">
                Page {pageNumber} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => onPageChange?.(pageNumber + 1)}
                disabled={pageNumber >= totalPages || isLoading || totalCount === 0}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    {pendingDeleteRow && onDelete && (
      <DeleteConfirmationModal
        title={deleteConfirmTitle}
        message={getDeleteMessage(pendingDeleteRow)}
        onCancel={() => {
          if (!isDeleting) setPendingDeleteRow(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    )}
    </>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function ViewIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}
