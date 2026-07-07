"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getAdminModuleApiPath,
  getAdminModuleEditPath,
  type AdminModuleKey,
} from "@/components/admin/commonTable/adminModuleTable.config";
import type { AdminViewProps } from "@/components/admin/views/adminViewRegistry";
import { normalizeImageArray } from "@/components/admin/forms/productForm.helpers";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";
import { getData } from "@/services/api/apiService";

type ProductImage = { url?: string; sortOrder?: number };
type ProductVariant = {
  id?: number;
  name?: string;
  slug?: string;
  sku?: string;
  price?: number | string;
  stock?: number | string;
  images?: ProductImage[];
};
type ProductRecord = {
  id: number;
  productName?: string;
  productSlug?: string;
  productType?: string;
  publishStatus?: string;
  shortDescription?: string;
  description?: string;
  isActive?: boolean;
  brand?: { brandName?: string };
  category?: { categoryName?: string };
  images?: ProductImage[];
  variants?: ProductVariant[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    canonicalUrl?: string;
    ogImage?: string;
  };
};

function formatPrice(value: unknown): string {
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  return `₹${num.toFixed(2)}`;
}

function collectProductViewImages(product: ProductRecord): string[] {
  const urls = new Set<string>();

  for (const url of normalizeImageArray(product.images)) {
    urls.add(url);
  }

  for (const variant of product.variants ?? []) {
    for (const url of normalizeImageArray(variant.images)) {
      urls.add(url);
    }
  }

  for (const url of normalizeImageArray(product.seo?.ogImage)) {
    urls.add(url);
  }

  return Array.from(urls);
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
        active ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function PublishBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const className =
    normalized === "published"
      ? "bg-emerald-50 text-emerald-700"
      : normalized === "draft"
        ? "bg-cyan-50 text-cyan-800"
        : "bg-orange-50 text-orange-700";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${className}`}>
      {status}
    </span>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-1 break-words text-sm text-zinc-900">{value}</p>
    </div>
  );
}

function ViewImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveImageUrl(src);

  if (!resolved || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-100 px-2 text-center text-xs text-zinc-500">
        Image unavailable
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      className="admin-product-view-image"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export function ProductView({ module, recordId }: AdminViewProps) {
  const router = useRouter();
  const apiPath = getAdminModuleApiPath(module as AdminModuleKey);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [product, setProduct] = useState<ProductRecord | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      setLoadError("");

      try {
        const response = await getData(`${apiPath}/${recordId}`);
        const data = response?.data;
        const record =
          data && typeof data === "object" && !Array.isArray(data)
            ? (data as ProductRecord)
            : ((response ?? {}) as ProductRecord);

        if (!cancelled) {
          setProduct(record);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Failed to load product.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [apiPath, recordId]);

  const imageUrls = useMemo(
    () => (product ? collectProductViewImages(product) : []),
    [product]
  );

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-zinc-200 bg-white">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
          <p className="text-sm text-zinc-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (loadError || !product?.id) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">{loadError || "Product not found."}</p>
        <button
          type="button"
          onClick={() => router.push(`/admin/${module}`)}
          className="mt-4 text-sm font-medium text-red-900 hover:underline"
        >
          Back to list
        </button>
      </div>
    );
  }

  const variants = product.variants ?? [];
  const storefrontSlug = variants[0]?.slug || product.productSlug;
  const isVariableProduct = String(product.productType ?? "").toLowerCase() === "variable";

  return (
    <div className="max-w-full space-y-6 overflow-x-hidden pb-2">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
          <Link href={`/admin/${module}`} className="hover:text-zinc-600">
            Back to list
          </Link>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-2xl font-semibold text-zinc-900">
              {product.productName || "Untitled product"}
            </h1>
            <p className="mt-1 break-all text-sm text-zinc-500">/{product.productSlug}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge active={Boolean(product.isActive)} />
            {product.publishStatus && <PublishBadge status={product.publishStatus} />}
            {storefrontSlug && (
              <Link
                href={`/product/${storefrontSlug}`}
                target="_blank"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                View on store
              </Link>
            )}
            <Link
              href={getAdminModuleEditPath(module, product.id)}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Edit product
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Product details
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Type" value={product.productType || "—"} />
          <InfoItem label="Brand" value={product.brand?.brandName || "—"} />
          <InfoItem label="Category" value={product.category?.categoryName || "—"} />
          <InfoItem label="Variants" value={variants.length} />
        </div>
        {product.shortDescription && (
          <p className="mt-5 break-words text-sm text-zinc-600">{product.shortDescription}</p>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          {isVariableProduct ? "Variant images" : "Product images"}
        </h2>
        {imageUrls.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {imageUrls.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50"
              >
                <ViewImage src={url} alt={`${product.productName ?? "Product"} image ${index + 1}`} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No images uploaded for this product.</p>
        )}
      </div>

      {product.description && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Description
          </h2>
          <div
            className="admin-rich-content text-sm leading-relaxed text-zinc-700"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}

      {variants.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Variants
          </h2>
          <div className="w-full max-w-full overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-400">
                  <th className="px-3 py-2">Image</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2">SKU</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Stock</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => {
                  const variantImage = normalizeImageArray(variant.images)[0];

                  return (
                    <tr
                      key={variant.id ?? variant.slug ?? variant.name}
                      className="border-b border-zinc-100"
                    >
                      <td className="px-3 py-3">
                        <div className="h-12 w-12 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
                          {variantImage ? (
                            <ViewImage
                              src={variantImage}
                              alt={variant.name || "Variant"}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                              —
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-medium text-zinc-900">
                        {variant.name || "—"}
                      </td>
                      <td className="max-w-[180px] truncate px-3 py-3 text-zinc-600">
                        {variant.slug || "—"}
                      </td>
                      <td className="px-3 py-3 text-zinc-600">{variant.sku || "—"}</td>
                      <td className="px-3 py-3 text-zinc-900">{formatPrice(variant.price)}</td>
                      <td className="px-3 py-3 text-zinc-900">{variant.stock ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {product.seo && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            SEO
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoItem label="Meta title" value={product.seo.metaTitle || "—"} />
            <InfoItem label="Meta keywords" value={product.seo.metaKeywords || "—"} />
            <div className="md:col-span-2">
              <InfoItem label="Meta description" value={product.seo.metaDescription || "—"} />
            </div>
            {product.seo.canonicalUrl && (
              <div className="md:col-span-2">
                <InfoItem label="Canonical URL" value={product.seo.canonicalUrl} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
