import { deleteData, getData, postData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { generateSlug } from "./generateSlug";

type ListOption = { label: string; value: string | number };

export type AttributeOption = ListOption & {
  supportsImage: boolean;
};

export type WarehouseOption = ListOption & {
  registrationStatus: string;
  isActive: boolean;
};

export async function fetchRegisteredWarehousesOptions(
  brandId: string | number
): Promise<WarehouseOption[]> {
  const response = await getData(API_ENDPOINTS.WAREHOUSES.LIST_BY_BRAND(brandId));
  const rows = response?.data;
  if (!Array.isArray(rows)) {
    throw new Error("Could not load pickup addresses for this brand");
  }

  return rows
    .filter(
      (warehouse: Record<string, unknown>) =>
        warehouse.registrationStatus === "REGISTERED" &&
        warehouse.isActive === true
    )
    .map((warehouse: Record<string, unknown>) => {
      const address = [
        warehouse.addressLine1,
        warehouse.addressLine2,
        warehouse.city,
        warehouse.state,
        warehouse.pincode,
      ]
        .filter((part) => typeof part === "string" && part.trim())
        .join(", ");
      return {
        label: `${String(warehouse.name ?? "Warehouse")} — ${address}`,
        value: Number(warehouse.id),
        registrationStatus: String(warehouse.registrationStatus),
        isActive: Boolean(warehouse.isActive),
      };
    });
}


export async function fetchListOptions(
  path: string,
  labelKey: string,
  valueKey = "id",
  params?: Record<string, string | number>
): Promise<ListOption[]> {
  try {
    const response = await getData(path, {
      pageNumber: 1,
      pageSize: 1000,
      column: "id",
      order: "DESC",
      ...params,
    });

    const rows = response.data?.rows ?? response.data ?? [];
    if (!Array.isArray(rows)) return [];

    return rows.map((row: Record<string, unknown>) => ({
      label: String(row[labelKey] ?? row.title ?? row.name ?? row.id),
      value: Number(row[valueKey]) || String(row[valueKey]),
    }));
  } catch {
    return [];
  }
}

export async function fetchCategoriesOptions() {
  return fetchListOptions("categories", "categoryName");
}

export async function fetchRootCategoriesOptions() {
  try {
    const response = await getData("categories/next/null");
    const rows = response.data ?? [];
    if (!Array.isArray(rows)) return [];

    return rows.map((row: Record<string, unknown>) => ({
      label: String(row.categoryName ?? row.name ?? row.id),
      value: Number(row.id),
    }));
  } catch {
    return [];
  }
}

export async function fetchChildCategoriesOptions(parentId: string | number) {
  try {
    const response = await getData(`categories/next/${parentId}`);
    const rows = response.data ?? [];
    if (!Array.isArray(rows)) return [];

    return rows.map((row: Record<string, unknown>) => ({
      label: String(row.categoryName ?? row.name ?? row.id),
      value: Number(row.id),
    }));
  } catch {
    return [];
  }
}

export async function fetchBrandsOptions() {
  return fetchListOptions("brands", "brandName");
}

export async function fetchOffersOptions() {
  return fetchListOptions("offers", "offerName");
}

export async function fetchProductsOptions() {
  return fetchListOptions("products", "productName");
}

export async function fetchUsersOptions() {
  return fetchListOptions("users", "firstName").then((options) =>
    options.map((opt, index) => {
      const row = opt;
      return row;
    })
  );
}

export async function fetchRolesOptions() {
  return fetchListOptions("roles", "roleName");
}

export async function fetchAttributesOptions(): Promise<AttributeOption[]> {
  try {
    const response = await getData("attributes", {
      pageNumber: 1,
      pageSize: 1000,
      column: "id",
      order: "DESC",
    });

    const rows = response.data?.rows ?? response.data ?? [];
    if (!Array.isArray(rows)) return [];

    return rows.map((row: Record<string, unknown>) => ({
      label: String(row.name ?? row.id),
      value: Number(row.id) || String(row.id),
      supportsImage: Boolean(row.supportsImage ?? false),
    }));
  } catch {
    return [];
  }
}

export async function fetchBlogCategoriesOptions() {
  return fetchListOptions("blog-categories", "title");
}

export async function fetchBlogTagsOptions() {
  return fetchListOptions("blog-tags", "title");
}

export async function fetchProductTagsOptions() {
  return fetchListOptions("product-tags", "tagName");
}

export async function createProductTag(tagName: string): Promise<ListOption> {
  const trimmedName = tagName.trim();
  if (!trimmedName) {
    throw new Error("Tag name is required");
  }

  const response = await postData("product-tags", {
    tagName: trimmedName,
    tagSlug: generateSlug(trimmedName),
    isActive: true,
  });

  const record = (response?.data ?? response) as Record<string, unknown>;
  const id = Number(record.id);

  if (!id) {
    throw new Error("Failed to create tag");
  }

  return {
    label: String(record.tagName ?? trimmedName),
    value: id,
  };
}

export async function deleteProductTag(id: number | string): Promise<void> {
  await deleteData(`product-tags/${id}`);
}

export async function fetchBlogsOptions() {
  return fetchListOptions("blogs", "title");
}

export async function fetchFaqsOptions() {
  return fetchListOptions("faqs", "question");
}

export async function fetchBannersOptions() {
  return fetchListOptions("banners", "title");
}

export async function fetchReviewsOptions() {
  return fetchListOptions("reviews", "comment");
}
