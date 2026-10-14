"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DataTable } from "@/components/common/DataTable";
import {
  getAdminModuleApiPath,
  getAdminModuleEditPath,
  getAdminModuleViewPath,
  getAdminModuleTableConfig,
} from "@/components/admin/commonTable/adminModuleTable.config";
import type { AdminModuleKey } from "@/components/admin/commonTable/adminModuleTable.config";
import { buildAdminTableColumns } from "@/components/admin/commonTable/buildAdminTableColumns";
import { FormDropdown } from "@/components/admin/forms/shared/FormDropdown";
import { fetchCategoriesOptions } from "@/components/admin/forms/shared/fetchOptions";
import { deleteData, getData } from "@/services/api/apiService";
import axios from "axios";

function readCategoryFilterFromUrl(): string {
  if (typeof window === "undefined") return "";
  const categoryId = new URLSearchParams(window.location.search).get("categoryId");
  return categoryId && /^\d+$/.test(categoryId) && Number(categoryId) > 0
    ? categoryId
    : "";
}

type AdminModuleTableProps = {
  module: AdminModuleKey;
};

export function AdminModuleTable({ module }: AdminModuleTableProps) {
  const config = getAdminModuleTableConfig(module);
  const apiPath = getAdminModuleApiPath(module);
  const sortColumn = config?.sortColumn ?? "id";
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isCategoryFilterReady, setIsCategoryFilterReady] = useState(
    module !== "products"
  );
  const [categoryOptions, setCategoryOptions] = useState<
    Array<{ label: string; value: string | number }>
  >([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const isFirstSearchChange = useRef(true);
  const previousDebouncedSearch = useRef(debouncedSearch);

  useEffect(() => {
    if (module !== "products") return;

    const syncCategoryFromUrl = () => {
      setCategoryId(readCategoryFilterFromUrl());
      setPageNumber(1);
      setIsCategoryFilterReady(true);
    };

    syncCategoryFromUrl();
    window.addEventListener("popstate", syncCategoryFromUrl);
    return () => window.removeEventListener("popstate", syncCategoryFromUrl);
  }, [module]);

  useEffect(() => {
    if (module !== "products") return;

    let isCurrent = true;
    fetchCategoriesOptions().then((options) => {
      if (isCurrent) setCategoryOptions(options);
    });

    return () => {
      isCurrent = false;
    };
  }, [module]);

  useEffect(() => {
    if (isFirstSearchChange.current) {
      isFirstSearchChange.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (previousDebouncedSearch.current === debouncedSearch) {
      return;
    }

    previousDebouncedSearch.current = debouncedSearch;
    setPageNumber(1);
  }, [debouncedSearch]);

  const loadData = useCallback(async () => {
    if (!config) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await getData(apiPath, {
        pageNumber,
        pageSize,
        column: sortColumn,
        order: "DESC",
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(module === "products" && categoryId ? { categoryId } : {}),
      });
      setData(response.data?.rows ?? response.data ?? []);
      setCount(response.data?.count ?? response.count ?? 0);
    } catch {
      setError("Failed to load data. Please try again.");
      setData([]);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [apiPath, categoryId, config, debouncedSearch, module, pageNumber, pageSize, sortColumn]);

  useEffect(() => {
    if (!config || (module === "products" && !isCategoryFilterReady)) return;

    const controller = new AbortController();

    async function fetchTableData() {
      setIsLoading(true);
      setError("");

      try {
        const response = await getData(
          apiPath,
          {
            pageNumber,
            pageSize,
            column: sortColumn,
            order: "DESC",
            ...(debouncedSearch ? { search: debouncedSearch } : {}),
            ...(module === "products" && categoryId ? { categoryId } : {}),
          },
          { signal: controller.signal }
        );

        setData(response.data?.rows ?? response.data ?? []);
        setCount(response.data?.count ?? response.count ?? 0);
      } catch (fetchError) {
        if (
          axios.isCancel(fetchError) ||
          (axios.isAxiosError(fetchError) && fetchError.code === "ERR_CANCELED") ||
          controller.signal.aborted
        ) {
          return;
        }

        setError("Failed to load data. Please try again.");
        setData([]);
        setCount(0);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchTableData();

    return () => controller.abort();
  }, [apiPath, categoryId, config, debouncedSearch, isCategoryFilterReady, module, pageNumber, pageSize, sortColumn]);

  if (!config) {
    return null;
  }

  const columns = buildAdminTableColumns(config.columns);
  const supportsAdd = config.actions.includes("add");
  const supportsEdit = config.actions.includes("edit");
  const supportsDelete = config.actions.includes("delete");

  return (
    <>
      {error && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={loadData}
            className="text-sm font-medium text-red-900 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      <DataTable<Record<string, unknown>>
        columns={columns}
        data={data}
        count={count}
        isLoading={isLoading}
        pageNumber={pageNumber}
        pageSize={pageSize}
        onPageChange={setPageNumber}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPageNumber(1);
        }}
        actions={config.actions}
        addLabel={config.addLabel}
        addHref={supportsAdd ? `/admin/${module}/add` : undefined}
        searchValue={search}
        onSearchChange={setSearch}
        isSearching={isLoading && Boolean(search.trim())}
        toolbarContent={
          module === "products" ? (
            <div className="w-full sm:w-56">
              <FormDropdown
                label=""
                value={categoryId}
                onChange={(value) => {
                  const nextCategoryId =
                    value && /^\d+$/.test(value) && Number(value) > 0 ? value : "";
                  setCategoryId(nextCategoryId);
                  setPageNumber(1);

                  const url = new URL(window.location.href);
                  if (nextCategoryId) {
                    url.searchParams.set("categoryId", nextCategoryId);
                  } else {
                    url.searchParams.delete("categoryId");
                  }
                  window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
                }}
                options={[{ label: "Filter by category", value: "" }, ...categoryOptions]}
                placeholder="Filter by category"
              />
            </div>
          ) : undefined
        }
        searchPlaceholder={`Search ${config.label.toLowerCase()}...`}
        viewHref={(row) => {
          const id = row.id;
          if (id === null || id === undefined || id === "") {
            return undefined;
          }
          return getAdminModuleViewPath(module, String(id));
        }}
        editHref={
          supportsEdit
            ? (row) => {
                const id = row.id;
                if (id === null || id === undefined || id === "") {
                  return `/admin/${module}`;
                }
                return getAdminModuleEditPath(module, String(id));
              }
            : undefined
        }
        onDelete={
          supportsDelete
            ? async (row) => {
                try {
                  await deleteData(`${apiPath}/${row.id}`);
                  if (data.length === 1 && pageNumber > 1) {
                    setPageNumber((current) => current - 1);
                  } else {
                    await loadData();
                  }
                } catch {
                  setError("Failed to delete record.");
                }
              }
            : undefined
        }
        deleteConfirmMessage={(row) => {
          const label = String(
            row.productName ??
              row.name ??
              row.title ??
              row.categoryName ??
              row.brandName ??
              row.tagName ??
              row.offerName ??
              row.firstName ??
              row.roleName ??
              row.question ??
              row.couponCode ??
              ""
          ).trim();

          return label
            ? `Are you sure you want to delete "${label}"? This action cannot be undone.`
            : `Are you sure you want to delete this ${config.label.toLowerCase().replace(/s$/, "")}? This action cannot be undone.`;
        }}
        getRowId={(row) => String(row.id ?? "")}
      />
    </>
  );
}
