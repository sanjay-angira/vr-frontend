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

export function hasVariantOptionGroups(
  variants: Array<{ id: number; variantAttributes: VariantAttributeView[] }>
): boolean {
  return buildAttributeGroups(variants).length > 0;
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

  const groups = Array.from(groupMap.values());

  return groups.sort((left, right) => {
    const leftPrimary = isPrimaryAttributeGroup(left);
    const rightPrimary = isPrimaryAttributeGroup(right);

    if (leftPrimary && !rightPrimary) return -1;
    if (!leftPrimary && rightPrimary) return 1;

    const leftIsColor = left.name.toLowerCase().includes("color");
    const rightIsColor = right.name.toLowerCase().includes("color");

    if (leftIsColor && !rightIsColor) return -1;
    if (!leftIsColor && rightIsColor) return 1;

    return left.attributeId - right.attributeId;
  });
}

export function isPrimaryAttributeGroup(group: AttributeSelectionGroup): boolean {
  return group.options.some(
    (option) => option.viewOption === "code" || option.viewOption === "image"
  );
}

export function splitAttributeGroups(groups: AttributeSelectionGroup[]): {
  primaryGroups: AttributeSelectionGroup[];
  secondaryGroups: AttributeSelectionGroup[];
} {
  const primaryGroups = groups.filter(isPrimaryAttributeGroup);
  const secondaryGroups = groups.filter((group) => !isPrimaryAttributeGroup(group));
  return { primaryGroups, secondaryGroups };
}

export function findVariantsMatchingSelections(
  variants: ProductVariantView[],
  selections: Record<number, string>
): ProductVariantView[] {
  const entries = Object.entries(selections).filter(([, value]) => Boolean(value));
  if (!entries.length) return variants;

  return variants.filter((variant) =>
    entries.every(([attributeId, value]) =>
      variant.variantAttributes.some(
        (item) => item.attributeId === Number(attributeId) && item.value === value
      )
    )
  );
}

export function pickBestVariantFromMatches(matches: ProductVariantView[]): ProductVariantView | null {
  if (!matches.length) return null;

  return [...matches].sort((left, right) => {
    const leftInStock = Number(left.stock) > 0;
    const rightInStock = Number(right.stock) > 0;
    if (leftInStock && !rightInStock) return -1;
    if (!leftInStock && rightInStock) return 1;
    return getVariantEffectivePrice(left) - getVariantEffectivePrice(right);
  })[0];
}

export function resolveVariantForSelection(
  variants: ProductVariantView[],
  groups: AttributeSelectionGroup[],
  selections: Record<number, string>
): ProductVariantView | null {
  const completeMatch = findVariantBySelections(variants, selections, groups);
  if (completeMatch) return completeMatch;

  const partialMatches = findVariantsMatchingSelections(variants, selections);
  return pickBestVariantFromMatches(partialMatches);
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
  nextSelections: Record<number, string>,
  pinnedAttributeId?: number
): Record<number, string> {
  const resolved = { ...nextSelections };

  for (const group of groups) {
    if (group.attributeId === pinnedAttributeId) {
      continue;
    }

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

export function canSelectAttributeOption(
  variants: ProductVariantView[],
  groups: AttributeSelectionGroup[],
  selections: Record<number, string>,
  group: AttributeSelectionGroup,
  option: VariantAttributeOption
): boolean {
  const resolved = resolveAttributeSelections(
    variants,
    groups,
    {
      ...selections,
      [group.attributeId]: option.value,
    },
    group.attributeId
  );

  return findVariantBySelections(variants, resolved, groups) !== null;
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

export function getVariantEffectivePrice(variant: ProductVariantView): number {
  const price = variant.pricing.finalPrice ?? variant.pricing.sellingPrice ?? variant.price;
  return typeof price === "number" && Number.isFinite(price)
    ? price
    : Number.POSITIVE_INFINITY;
}

export function getCheapestVariant(
  variants: ProductVariantView[]
): ProductVariantView | null {
  if (!variants.length) return null;

  return variants.reduce((cheapest, current) =>
    getVariantEffectivePrice(current) < getVariantEffectivePrice(cheapest)
      ? current
      : cheapest
  );
}

export function findVariantBySlug(
  variants: ProductVariantView[],
  slug: string | null | undefined
): ProductVariantView | null {
  if (!slug) return null;

  const normalized = slug.trim().toLowerCase();
  return (
    variants.find((variant) => variant.slug?.toLowerCase() === normalized) ?? null
  );
}

export function resolveInitialVariant(
  variants: ProductVariantView[],
  options: {
    variantSlug?: string | null;
  } = {}
): ProductVariantView | null {
  if (!variants.length) return null;

  const fromUrl = findVariantBySlug(variants, options.variantSlug);
  if (fromUrl) return fromUrl;

  return variants[0];
}

export type VariantDisplayGroup = {
  attributeId: number;
  attributeName: string;
  value: string;
  label: string;
  code?: string | null;
  image?: string | null;
  viewOption: "value" | "code" | "image";
  variants: ProductVariantView[];
  cheapestInGroup: ProductVariantView | null;
};

function inferPrimaryValueFromName(variant: ProductVariantView): string {
  const parts = variant.name.split("-").map((part) => part.trim()).filter(Boolean);
  return parts[0] || variant.name;
}

function inferSecondaryLabel(
  variant: ProductVariantView,
  primaryAttributeId: number | null
): string {
  const secondaryAttributes = primaryAttributeId
    ? variant.variantAttributes.filter((item) => item.attributeId !== primaryAttributeId)
    : variant.variantAttributes;

  if (secondaryAttributes.length > 0) {
    return secondaryAttributes.map((item) => item.value).join(" · ");
  }

  const parts = variant.name.split("-").map((part) => part.trim()).filter(Boolean);
  if (parts.length > 1) {
    return parts.slice(1).join(" · ");
  }

  return variant.name;
}

export function buildGroupedVariantDisplay(
  variants: ProductVariantView[],
  attributeGroups: AttributeSelectionGroup[] = []
): {
  primaryAttributeName: string;
  groups: VariantDisplayGroup[];
  secondaryAttributeNames: string[];
} {
  if (!variants.length) {
    return { primaryAttributeName: "Variant", groups: [], secondaryAttributeNames: [] };
  }

  const primaryGroup = attributeGroups[0] ?? null;
  const secondaryGroups = attributeGroups.slice(1);
  const secondaryAttributeNames = secondaryGroups.map((group) => group.name);

  if (primaryGroup) {
    const groups = primaryGroup.options.map((option) => {
      const groupVariants = variants
        .filter((variant) =>
          variant.variantAttributes.some(
            (attribute) =>
              attribute.attributeId === primaryGroup.attributeId &&
              attribute.value === option.value
          )
        )
        .sort((left, right) => getVariantEffectivePrice(left) - getVariantEffectivePrice(right));

      return {
        attributeId: primaryGroup.attributeId,
        attributeName: primaryGroup.name,
        value: option.value,
        label: option.label,
        code: option.code,
        image: option.image,
        viewOption: option.viewOption,
        variants: groupVariants,
        cheapestInGroup: getCheapestVariant(groupVariants),
      };
    });

    return {
      primaryAttributeName: primaryGroup.name,
      groups: groups.filter((group) => group.variants.length > 0),
      secondaryAttributeNames,
    };
  }

  const groupedByName = new Map<string, ProductVariantView[]>();
  for (const variant of variants) {
    const primaryValue = inferPrimaryValueFromName(variant);
    const bucket = groupedByName.get(primaryValue) ?? [];
    bucket.push(variant);
    groupedByName.set(primaryValue, bucket);
  }

  const groups = Array.from(groupedByName.entries()).map(([value, groupVariants]) => {
    const sortedVariants = [...groupVariants].sort(
      (left, right) => getVariantEffectivePrice(left) - getVariantEffectivePrice(right)
    );

    return {
      attributeId: 0,
      attributeName: "Variant",
      value,
      label: value,
      code: null,
      image: null,
      viewOption: "value" as const,
      variants: sortedVariants,
      cheapestInGroup: getCheapestVariant(sortedVariants),
    };
  });

  return {
    primaryAttributeName: "Variant",
    groups,
    secondaryAttributeNames: [],
  };
}

export function getSecondaryVariantLabel(
  variant: ProductVariantView,
  primaryAttributeId: number | null
): string {
  return inferSecondaryLabel(variant, primaryAttributeId);
}

export function buildProductVariantUrl(
  productSlug: string,
  variantSlug?: string | null
): string {
  const base = `/product/${productSlug}`;
  if (!variantSlug) return base;

  const params = new URLSearchParams({ variant: variantSlug });
  return `${base}?${params.toString()}`;
}

/** Update variant query in the URL without triggering a Next.js navigation / server refetch. */
export function replaceProductVariantInUrl(
  productSlug: string,
  variantSlug?: string | null
): void {
  if (typeof window === "undefined") return;

  const nextUrl = buildProductVariantUrl(productSlug, variantSlug);
  window.history.replaceState(window.history.state, "", nextUrl);
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
