import { getData } from "@/services/api/apiService";

type ListOption = { label: string; value: string | number };


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

export async function fetchAttributesOptions() {
  return fetchListOptions("attributes", "name");
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
