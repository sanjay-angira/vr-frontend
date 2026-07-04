import type { FormikErrors } from "formik";
import { getIn } from "formik";

export type AttributeViewOption = "value" | "code" | "image";

export const ATTRIBUTE_VIEW_OPTIONS: Array<{
  label: string;
  value: AttributeViewOption;
}> = [
  { label: "Color Name", value: "value" },
  { label: "Color Code", value: "code" },
  { label: "Color Image", value: "image" },
];

export type VariantAttributeValue = {
  attributeId: number;
  value: string;
  code?: string;
  image?: string;
  viewOption?: AttributeViewOption;
};

export function isColorAttribute(attributeName: string): boolean {
  return attributeName.trim().toLowerCase() === "color";
}

export function buildAttributeNameById(
  attributeIds: number[],
  options: Array<{ label: string; value: string | number }>
): Record<number, string> {
  const map: Record<number, string> = {};

  for (const attributeId of attributeIds) {
    const option = options.find((item) => Number(item.value) === attributeId);
    if (option) {
      map[attributeId] = option.label;
    }
  }

  return map;
}

export function createEmptyVariantAttribute(
  attributeId: number,
  attributeName?: string
): VariantAttributeValue {
  if (attributeName && isColorAttribute(attributeName)) {
    return {
      attributeId,
      value: "",
      code: "#000000",
      image: "",
      viewOption: "value",
    };
  }

  return { attributeId, value: "" };
}

export type ProductVariant = {
  id?: number;
  name: string;
  sku: string;
  price: number | "";
  stock: number | "";
  productVariantOffers: number[];
  images: string[];
  variantAttributes: VariantAttributeValue[];
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
  attributeIds: number[];
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
  images: [],
  variantAttributes: [],
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
  attributeIds: [],
  variants: [emptyVariant()],
  seo: {
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    ogImage: "",
  },
};

export function syncVariantAttributes(
  variants: ProductVariant[],
  attributeIds: number[],
  attributeNameById: Record<number, string> = {}
): ProductVariant[] {
  return variants.map((variant) => ({
    ...variant,
    variantAttributes: attributeIds.map((attributeId) => {
      const attributeName = attributeNameById[attributeId];
      const existing = variant.variantAttributes.find(
        (item) => item.attributeId === attributeId
      );

      if (existing) {
        if (attributeName && isColorAttribute(attributeName)) {
          return {
            ...existing,
            code: existing.code ?? "#000000",
            image: existing.image ?? "",
            viewOption: existing.viewOption ?? "value",
          };
        }
        return existing;
      }

      return createEmptyVariantAttribute(attributeId, attributeName);
    }),
  }));
}

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

export function mapAttributeIdsFromRecord(record: Record<string, unknown>): number[] {
  if (Array.isArray(record.productAttributes)) {
    return (record.productAttributes as Record<string, unknown>[])
      .map((item) => {
        const attribute = item.attribute as { id?: number } | undefined;
        return Number(attribute?.id ?? item.attributeId);
      })
      .filter((id) => !Number.isNaN(id) && id > 0);
  }

  if (Array.isArray(record.attributes)) {
    return (record.attributes as Record<string, unknown>[])
      .map((item) => Number(item.attributeId ?? item.id))
      .filter((id) => !Number.isNaN(id) && id > 0);
  }

  return [];
}

export function mapVariantAttributesFromRecord(
  variant: Record<string, unknown>
): VariantAttributeValue[] {
  if (!Array.isArray(variant.variantAttributes)) return [];

  return (variant.variantAttributes as Record<string, unknown>[])
    .map((item) => {
      const attributeName = String(
        (item.attribute as { name?: string } | undefined)?.name ?? ""
      );
      const mapped: VariantAttributeValue = {
        attributeId: Number(
          (item.attribute as { id?: number } | undefined)?.id ?? item.attributeId
        ),
        value: String(item.value ?? ""),
      };

      if (item.code != null || isColorAttribute(attributeName)) {
        mapped.code = String(item.code ?? "#000000");
      }
      if (item.image != null || isColorAttribute(attributeName)) {
        mapped.image = String(item.image ?? "");
      }
      if (item.viewOption != null || isColorAttribute(attributeName)) {
        const viewOption = String(item.viewOption ?? "value");
        if (viewOption === "value" || viewOption === "code" || viewOption === "image") {
          mapped.viewOption = viewOption;
        }
      }

      return mapped;
    })
    .filter((item) => !Number.isNaN(item.attributeId) && item.attributeId > 0);
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
  const isVariableProduct = values.productType === "variable";
  const productImages = isVariableProduct
    ? []
    : normalizeImageArray(values.images).map((url, index) => ({
        url,
        sortOrder: index + 1,
      }));

  const attributes = values.attributeIds.map((attributeId) => ({ attributeId }));

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
    attributes,
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

      if (values.productType === "simple") {
        variantPayload.images = [];
      } else if (variantImages.length > 0) {
        variantPayload.images = variantImages;
      }

      if (variant.productVariantOffers.length > 0) {
        variantPayload.productVariantOffers = variant.productVariantOffers;
      }

      const variantAttributes = variant.variantAttributes
        .filter((item) => item.value.trim())
        .map((item) => {
          const payload: Record<string, unknown> = {
            attributeId: item.attributeId,
            value: item.value.trim(),
          };

          if (item.code?.trim()) {
            payload.code = item.code.trim();
          }
          if (item.image?.trim()) {
            payload.image = item.image.trim();
          }
          if (item.viewOption) {
            payload.viewOption = item.viewOption;
          }

          return payload;
        });

      if (variantAttributes.length > 0) {
        variantPayload.variantAttributes = variantAttributes;
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

function variantAttributesAreValid(
  values: ProductFormValues,
  attributeNameById: Record<number, string> = {}
) {
  if (values.attributeIds.length === 0) return true;

  return values.variants.every((variant) =>
    values.attributeIds.every((attributeId) => {
      const match = variant.variantAttributes.find(
        (item) => item.attributeId === attributeId
      );
      if (!match?.value?.trim()) return false;

      const attributeName = attributeNameById[attributeId] ?? "";
      if (!isColorAttribute(attributeName)) {
        return true;
      }

      return (
        Boolean(match.code?.trim()) &&
        Boolean(match.image?.trim()) &&
        Boolean(match.viewOption)
      );
    })
  );
}

export function isProductStepValid(
  step: number,
  values: ProductFormValues,
  errors: FormikErrors<ProductFormValues>,
  attributeNameById: Record<number, string> = {}
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
      return (
        values.variants.every(
          (variant, index) =>
            Boolean(variant.name?.trim()) &&
            variant.price !== "" &&
            Number(variant.price) >= 0.01 &&
            variant.stock !== "" &&
            Number(variant.stock) >= 0 &&
            !hasFieldError(errors, `variants.${index}.name`) &&
            !hasFieldError(errors, `variants.${index}.price`) &&
            !hasFieldError(errors, `variants.${index}.stock`)
        ) && variantAttributesAreValid(values, attributeNameById)
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
    "attributeIds",
  ],
  2: ["variants"],
  3: ["seo.metaTitle", "seo.metaDescription", "seo.metaKeywords", "seo.canonicalUrl", "seo.ogImage"],
};
