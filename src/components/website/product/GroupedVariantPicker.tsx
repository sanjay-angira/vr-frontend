"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";
import type { ProductVariantView } from "@/components/website/product/productApi";
import {
  buildAttributeGroups,
  findVariantBySelections,
  getCompatibleVariantIds,
  getVariantEffectivePrice,
  resolveAttributeSelections,
  selectionsFromVariant,
  type AttributeSelectionGroup,
  type VariantAttributeOption,
} from "@/components/website/product/productVariantUtils";

type GroupedVariantPickerProps = {
  variants: ProductVariantView[];
  attributeGroups: AttributeSelectionGroup[];
  selectedVariantId: number | null;
  cheapestVariant: ProductVariantView | null;
  onSelectVariant: (variant: ProductVariantView) => void;
};

function toCurrency(value: number | null | undefined): string | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return `Rs. ${value.toFixed(2)}`;
}

function AttributeOption({
  option,
  isSelected,
  isDisabled,
  showPrice,
  priceLabel,
  isBestPrice,
  onSelect,
}: {
  option: VariantAttributeOption;
  isSelected: boolean;
  isDisabled: boolean;
  showPrice?: boolean;
  priceLabel?: string | null;
  isBestPrice?: boolean;
  onSelect: () => void;
}) {
  const isVisual = option.viewOption === "code" || option.viewOption === "image";

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isDisabled}
      aria-pressed={isSelected}
      aria-label={option.label}
      title={option.label}
      className={[
        "product-variation-option",
        isSelected ? "is-selected" : "",
        isDisabled ? "is-disabled" : "",
        isVisual ? "product-variation-option--visual" : "",
        showPrice ? "product-variation-option--priced" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {option.viewOption === "code" && option.code ? (
        <>
          <span
            className="product-variation-option__swatch"
            style={{ backgroundColor: option.code }}
            aria-hidden="true"
          />
          <span className="product-variation-option__label">{option.label}</span>
        </>
      ) : option.viewOption === "image" && option.image ? (
        <span className="product-variation-option__image-wrap">
          <Image
            src={option.image}
            alt=""
            width={44}
            height={44}
            className="product-variation-option__image"
          />
        </span>
      ) : (
        <span className="product-variation-option__label">{option.label}</span>
      )}

      {showPrice && priceLabel && (
        <span className="product-variation-option__price">{priceLabel}</span>
      )}

      {isBestPrice && <span className="product-variation-option__badge">Best price</span>}
    </button>
  );
}

function getCheapestVariantForOption(
  variants: ProductVariantView[],
  option: VariantAttributeOption
): ProductVariantView | null {
  const matches = variants.filter((variant) => option.variantIds.includes(variant.id));
  if (!matches.length) return null;

  return matches.reduce((cheapest, current) =>
    getVariantEffectivePrice(current) < getVariantEffectivePrice(cheapest) ? current : cheapest
  );
}

export default function GroupedVariantPicker({
  variants,
  attributeGroups,
  selectedVariantId,
  cheapestVariant,
  onSelectVariant,
}: GroupedVariantPickerProps) {
  const groups =
    attributeGroups.length > 0 ? attributeGroups : buildAttributeGroups(variants);

  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ?? null;
  const selections = selectionsFromVariant(selectedVariant);
  const compatibleVariantIds = getCompatibleVariantIds(variants, selections);

  if (variants.length <= 1 || groups.length === 0) {
    return null;
  }

  const handleOptionSelect = (group: AttributeSelectionGroup, value: string) => {
    const nextSelections = resolveAttributeSelections(variants, groups, {
      ...selections,
      [group.attributeId]: value,
    });

    const matchedVariant = findVariantBySelections(variants, nextSelections, groups);
    if (matchedVariant) {
      onSelectVariant(matchedVariant);
      return;
    }

    const partialVariant = variants.find((variant) =>
      variant.variantAttributes.some(
        (attribute) =>
          attribute.attributeId === group.attributeId && attribute.value === value
      )
    );

    if (partialVariant) {
      onSelectVariant(partialVariant);
    }
  };

  const isLastGroup = (index: number) => index === groups.length - 1;

  return (
    <div className="product-grouped-variants product-inline-variants">
      <div className="product-variation-head">
        <Sparkles size={15} color="var(--text-saffron)" />
        <h3 className="product-variation-title">Choose Options</h3>
      </div>

      <div className="product-inline-variant-rows">
        {groups.map((group, groupIndex) => {
          const selectedValue = selections[group.attributeId];
          const showPrices = isLastGroup(groupIndex) && groups.length > 1;

          return (
            <div key={group.attributeId} className="product-inline-variant-row">
              <div className="product-inline-variant-row__head">
                <span className="product-variation-label">{group.name}</span>
                {selectedValue && (
                  <span className="product-variation-selected">{selectedValue}</span>
                )}
              </div>

              <div className="product-inline-variant-row__options">
                {group.options.map((option) => {
                  const isSelected = selectedValue === option.value;
                  const isDisabled = !option.variantIds.some((id) =>
                    compatibleVariantIds.has(id)
                  );
                  const cheapestForOption = showPrices
                    ? getCheapestVariantForOption(variants, option)
                    : null;
                  const priceLabel = cheapestForOption
                    ? toCurrency(
                        cheapestForOption.finalPrice ?? cheapestForOption.price
                      )
                    : null;
                  const isBestPrice = Boolean(
                    cheapestForOption && cheapestVariant?.id === cheapestForOption.id
                  );

                  return (
                    <AttributeOption
                      key={`${group.attributeId}-${option.value}`}
                      option={option}
                      isSelected={isSelected}
                      isDisabled={isDisabled}
                      showPrice={showPrices}
                      priceLabel={priceLabel}
                      isBestPrice={isBestPrice}
                      onSelect={() => {
                        if (!isDisabled) {
                          handleOptionSelect(group, option.value);
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
