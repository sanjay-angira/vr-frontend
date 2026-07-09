import type { ProductVariantView } from "./productApi";

export type VariantAttributeView = {
  attributeId: number;
  name: string;
  value: string;
  code?: string | null;
  image?: string | null;
  viewOption: "value" | "code" | "image";
};

export type VariantAttributeOption = {
  value: string;
  label: string;
  code?: string | null;
  image?: string | null;
  viewOption: "value" | "code" | "image";
  variantIds: number[];
};

export type AttributeSelectionGroup = {
  attributeId: number;
  name: string;
  options: VariantAttributeOption[];
};

function normalizeViewOption(value: unknown): "value" | "code" | "image" {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "code" || normalized === "image") return normalized;
  return "value";
}

export function normalizeVariantAttributes(
  rawAttributes: Array<Record<string, unknown>> = []
): VariantAttributeView[] {
  return rawAttributes
    .map((item) => {
      const attribute = item.attribute as Record<string, unknown> | undefined;
      const attributeId = Number(attribute?.id ?? item.attributeId);
      const name = String(attribute?.name ?? "").trim();
      const value = String(item.value ?? "").trim();
      const code = item.code ? String(item.code).trim() : null;
      const image = item.image ? String(item.image).trim() : null;

      let viewOption = normalizeViewOption(item.viewOption);
      if (viewOption === "value" && image) viewOption = "image";
      else if (viewOption === "value" && code) viewOption = "code";

      return { attributeId, name, value, code, image, viewOption };
    })
    .filter((item) => item.attributeId > 0 && item.name && item.value);
}

export function buildAttributeGroups(
  variants: Array<{ id: number; variantAttributes: VariantAttributeView[] }>
): AttributeSelectionGroup[] {
  const groupMap = new Map<number, AttributeSelectionGroup>();

  for (const variant of variants) {
    for (const attribute of variant.variantAttributes) {
      if (!groupMap.has(attribute.attributeId)) {
        groupMap.set(attribute.attributeId, {
          attributeId: attribute.attributeId,
          name: attribute.name,
          options: [],
        });
      }

      const group = groupMap.get(attribute.attributeId)!;
      let option = group.options.find((item) => item.value === attribute.value);

      if (!option) {
        option = {
          value: attribute.value,
          label: attribute.value,
          code: attribute.code,
          image: attribute.image,
          viewOption: attribute.viewOption,
          variantIds: [],
        };
        group.options.push(option);
      }

      if (!option.variantIds.includes(variant.id)) {
        option.variantIds.push(variant.id);
      }
    }
  }

  return Array.from(groupMap.values());
}

export function getCompatibleVariantIds(
  variants: ProductVariantView[],
  selections: Record<number, string>,
  excludeAttributeId?: number
): Set<number> {
  const compatible = variants.filter((variant) =>
    Object.entries(selections).every(([attributeId, value]) => {
      if (!value || Number(attributeId) === excludeAttributeId) return true;

      return variant.variantAttributes.some(
        (item) => item.attributeId === Number(attributeId) && item.value === value
      );
    })
  );

  return new Set(compatible.map((variant) => variant.id));
}

export function resolveAttributeSelections(
  variants: ProductVariantView[],
  groups: AttributeSelectionGroup[],
  nextSelections: Record<number, string>
): Record<number, string> {
  const resolved = { ...nextSelections };

  for (const group of groups) {
    const compatibleIds = getCompatibleVariantIds(variants, resolved, group.attributeId);
    const currentValue = resolved[group.attributeId];
    const currentOption = group.options.find((item) => item.value === currentValue);
    const isCurrentCompatible = currentOption?.variantIds.some((id) => compatibleIds.has(id));

    if (!isCurrentCompatible) {
      const fallback = group.options.find((item) =>
        item.variantIds.some((id) => compatibleIds.has(id))
      );
      if (fallback) {
        resolved[group.attributeId] = fallback.value;
      } else {
        delete resolved[group.attributeId];
      }
    }
  }

  return resolved;
}

export function findVariantBySelections(
  variants: ProductVariantView[],
  selections: Record<number, string>,
  groups: AttributeSelectionGroup[]
): ProductVariantView | null {
  if (!variants.length) return null;

  const requiredAttributeIds = groups.map((group) => group.attributeId);
  if (!requiredAttributeIds.length) return variants[0];

  const allSelected = requiredAttributeIds.every((attributeId) =>
    Boolean(selections[attributeId])
  );
  if (!allSelected) return null;

  return (
    variants.find((variant) =>
      requiredAttributeIds.every((attributeId) =>
        variant.variantAttributes.some(
          (item) =>
            item.attributeId === attributeId && item.value === selections[attributeId]
        )
      )
    ) ?? null
  );
}

export function selectionsFromVariant(
  variant: ProductVariantView | null | undefined
): Record<number, string> {
  if (!variant) return {};

  return variant.variantAttributes.reduce<Record<number, string>>((map, item) => {
    map[item.attributeId] = item.value;
    return map;
  }, {});
}

export function buildSpecRows(
  variant: ProductVariantView | null,
  fallbackAttributes: Array<{ id: number; name: string; value: string }> = []
) {
  if (variant?.variantAttributes?.length) {
    return variant.variantAttributes.map((item, index) => ({
      id: item.attributeId || index,
      name: item.name,
      value: item.value,
    }));
  }

  return fallbackAttributes;
}
