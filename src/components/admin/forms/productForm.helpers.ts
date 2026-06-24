import type { FormikErrors } from "formik";
import { getIn } from "formik";

export type VariantAttribute = {
  attributeId: number | "";
  optionId: number | "";
  value: string;
};

export type ProductVariant = {
  id?: number;
  name: string;
  sku: string;
  price: number | "";
  stock: number | "";
  productVariantOffers: number[];
  attributes: VariantAttribute[];
  images: string[];
};

export type ProductSeoValues = {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  ogImage: string;
};

export type ProductFormValues = {
  productName: string;
  productSlug: string;
  shortDescription: string;
  description: string;
  productType: "simple" | "variable";
  publishStatus: string;
  brandId: string;
  category: string;
  childCategories: string[];
  isActive: boolean;
  productOffers: number[];
  productTags: number[];
  frequentlyBoughtTogether: number[];
  images: string[];
  variants: ProductVariant[];
  seo: ProductSeoValues;
};

export const PRODUCT_FORM_STEPS = [
  { id: 1, label: "Product Information" },
  { id: 2, label: "Product Variations" },
  { id: 3, label: "Product SEO Settings" },
] as const;

export const emptyVariant = (): ProductVariant => ({
  name: "",
  sku: "",
  price: "",
  stock: 1,
  productVariantOffers: [],
  attributes: [],
  images: [],
});

export const productFormInitialValues: ProductFormValues = {
  productName: "",
  productSlug: "",
  shortDescription: "",
  description: "",
  productType: "simple",
  publishStatus: "draft",
  brandId: "",
  category: "",
  childCategories: [],
  isActive: true,
  productOffers: [],
  productTags: [],
  frequentlyBoughtTogether: [],
  images: [],
  variants: [emptyVariant()],
  seo: {
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    ogImage: "",
  },
};

export function normalizeIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) =>
      typeof item === "object" && item && "id" in item
        ? Number((item as { id: number }).id)
        : Number(item)
    )
    .filter((id) => !Number.isNaN(id));
}

export function normalizeImageArray(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === "string") return value.trim() ? [value.trim()] : [];

  const arr = Array.isArray(value)
    ? value
    : typeof value === "object"
      ? Object.values(value as Record<string, unknown>)
      : [value];

  return arr
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        const img = item as Record<string, unknown>;
        const url = img.url ?? img.image ?? img.Location ?? img.imageUrl ?? "";
        return String(url).trim();
      }
      return "";
    })
    .filter((url) => url.length > 0);
}

export { resolveImageUrl } from "./shared/resolveImageUrl";

export function mapProductImagesFromRecord(
  record: Record<string, unknown>,
  productType: string,
  variants: ProductVariant[]
): string[] {
  const fromProduct = normalizeImageArray(record.images);
  if (fromProduct.length > 0) return fromProduct;

  const fromAlternate = normalizeImageArray(record.productImages ?? record.productImage);
  if (fromAlternate.length > 0) return fromAlternate;

  if (productType === "simple" && variants.length > 0) {
    return normalizeImageArray(variants[0].images);
  }

  return [];
}

export function getDeepestCategoryId(values: ProductFormValues): number | "" {
  for (let i = values.childCategories.length - 1; i >= 0; i -= 1) {
    const child = values.childCategories[i];
    if (child) return Number(child);
  }
  return values.category ? Number(values.category) : "";
}

export function buildProductPayload(values: ProductFormValues): Record<string, unknown> {
  const isSimpleProduct = values.productType === "simple";
  const isVariableProduct = values.productType === "variable";
  const productImages = isVariableProduct
    ? []
    : normalizeImageArray(values.images).map((url, index) => ({
        url,
        sortOrder: index + 1,
      }));

  return {
    productName: values.productName,
    productSlug: values.productSlug,
    shortDescription: values.shortDescription,
    description: values.description,
    productType: values.productType,
    publishStatus: values.publishStatus,
    isActive: values.isActive,
    brandId: Number(values.brandId),
    category: getDeepestCategoryId(values),
    productOffers: values.productOffers,
    productTags: values.productTags,
    frequentlyBoughtTogether: values.frequentlyBoughtTogether,
    images: productImages,
    variants: values.variants.map((variant) => {
      const variantPayload: Record<string, unknown> = {
        ...(variant.id ? { id: variant.id } : {}),
        name: variant.name,
        price: Number(variant.price),
        stock: Number(variant.stock),
        ...(variant.sku ? { sku: variant.sku } : {}),
      };

      const variantImages = normalizeImageArray(variant.images).map((url, idx) => ({
        url,
        sortOrder: idx + 1,
      }));

      if (isSimpleProduct) {
        variantPayload.images = [];
      } else if (variantImages.length > 0) {
        variantPayload.images = variantImages;
      }

      if (variant.productVariantOffers.length > 0) {
        variantPayload.productVariantOffers = variant.productVariantOffers;
      }

      const attributes = variant.attributes
        .filter((attr) => attr.attributeId)
        .map((attr) => ({
          attributeId: Number(attr.attributeId),
          ...(attr.optionId ? { optionId: Number(attr.optionId) } : {}),
          ...(attr.value ? { value: attr.value } : {}),
        }));

      if (attributes.length > 0) {
        variantPayload.attributes = attributes;
      }

      return variantPayload;
    }),
    seo: {
      metaTitle: values.seo.metaTitle,
      metaDescription: values.seo.metaDescription,
      metaKeywords: values.seo.metaKeywords,
      canonicalUrl: values.seo.canonicalUrl,
      ogImage: values.seo.ogImage,
      metaRobots: "index, follow",
      twitterCard: "summary_large_image",
      schemaType: "Product",
    },
  };
}

function hasFieldError(errors: FormikErrors<ProductFormValues>, path: string) {
  return Boolean(getIn(errors, path));
}

export function isProductStepValid(
  step: number,
  values: ProductFormValues,
  errors: FormikErrors<ProductFormValues>
): boolean {
  switch (step) {
    case 1: {
      const categorySelected = Boolean(values.category || values.childCategories.some(Boolean));
      const descriptionText = values.description?.replace(/<[^>]*>/g, "").trim() ?? "";
      return (
        Boolean(values.productName?.trim()) &&
        Boolean(values.productSlug?.trim()) &&
        Boolean(values.shortDescription?.trim()) &&
        Boolean(descriptionText) &&
        Boolean(values.productType) &&
        Boolean(values.publishStatus) &&
        Boolean(values.brandId) &&
        categorySelected &&
        !hasFieldError(errors, "productName") &&
        !hasFieldError(errors, "productSlug") &&
        !hasFieldError(errors, "shortDescription") &&
        !hasFieldError(errors, "description") &&
        !hasFieldError(errors, "brandId") &&
        !hasFieldError(errors, "category")
      );
    }
    case 2: {
      if (values.variants.length === 0) return false;
      return values.variants.every(
        (variant, index) =>
          Boolean(variant.name?.trim()) &&
          variant.price !== "" &&
          Number(variant.price) >= 0.01 &&
          variant.stock !== "" &&
          Number(variant.stock) >= 0 &&
          !hasFieldError(errors, `variants.${index}.name`) &&
          !hasFieldError(errors, `variants.${index}.price`) &&
          !hasFieldError(errors, `variants.${index}.stock`)
      );
    }
    case 3:
      return (
        Boolean(values.seo.metaTitle?.trim()) &&
        Boolean(values.seo.metaDescription?.trim()) &&
        !hasFieldError(errors, "seo.metaTitle") &&
        !hasFieldError(errors, "seo.metaDescription")
      );
    default:
      return false;
  }
}

export const STEP_TOUCH_FIELDS: Record<number, string[]> = {
  1: [
    "productName",
    "productSlug",
    "shortDescription",
    "description",
    "productType",
    "publishStatus",
    "brandId",
    "category",
    "childCategories",
  ],
  2: ["variants"],
  3: ["seo.metaTitle", "seo.metaDescription", "seo.metaKeywords", "seo.canonicalUrl", "seo.ogImage"],
};
