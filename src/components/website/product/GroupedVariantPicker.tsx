"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";
import type { ProductVariantView } from "@/components/website/product/productApi";
import {
  buildAttributeGroups,
  canSelectAttributeOption,
  resolveAttributeSelections,
  resolveVariantForSelection,
  selectionsFromVariant,
  splitAttributeGroups,
  type AttributeSelectionGroup,
  type VariantAttributeOption,
} from "@/components/website/product/productVariantUtils";

type GroupedVariantPickerProps = {
  variants: ProductVariantView[];
  attributeGroups: AttributeSelectionGroup[];
  selectedVariantId: number | null;
  onSelectVariant: (variant: ProductVariantView) => void;
};

function AttributeRowHead({
  name,
  selectedValue,
}: {
  name: string;
  selectedValue?: string;
}) {
  return (
    <div className="product-variant-attribute-row__head">
      <span className="product-variation-label">Selected {name}</span>
      {selectedValue && (
        <span className="product-variation-selected">{selectedValue}</span>
      )}
    </div>
  );
}

function PrimaryAttributeOption({
  option,
  isSelected,
  isDisabled,
  onSelect,
}: {
  option: VariantAttributeOption;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}) {
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
        "product-variation-option--visual",
        "product-variant-primary-option",
        isSelected ? "is-selected" : "",
        isDisabled ? "is-disabled" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {option.viewOption === "code" && option.code ? (
        <span
          className="product-variation-option__swatch product-variant-primary-swatch"
          style={{ backgroundColor: option.code }}
          aria-hidden="true"
        />
      ) : option.viewOption === "image" && option.image ? (
        <span className="product-variation-option__image-wrap product-variant-primary-image-wrap">
          <Image
            src={option.image}
            alt={option.label}
            width={40}
            height={40}
            className="product-variation-option__image"
          />
        </span>
      ) : (
        <span className="product-variation-option__label">{option.label}</span>
      )}
    </button>
  );
}

function SecondaryAttributeOption({
  option,
  isSelected,
  isDisabled,
  onSelect,
}: {
  option: VariantAttributeOption;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isDisabled}
      aria-pressed={isSelected}
      aria-label={option.label}
      className={[
        "product-variation-option",
        isSelected ? "is-selected" : "",
        isDisabled ? "is-disabled" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="product-variation-option__label">{option.label}</span>
    </button>
  );
}

export default function GroupedVariantPicker({
  variants,
  attributeGroups,
  selectedVariantId,
  onSelectVariant,
}: GroupedVariantPickerProps) {
  const groups =
    attributeGroups.length > 0 ? attributeGroups : buildAttributeGroups(variants);
  const { primaryGroups, secondaryGroups } = splitAttributeGroups(groups);

  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ?? variants[0] ?? null;
  const selections = selectionsFromVariant(selectedVariant);

  const isOptionCompatible = (
    group: AttributeSelectionGroup,
    option: VariantAttributeOption
  ) => canSelectAttributeOption(variants, groups, selections, group, option);

  if (groups.length === 0) {
    return null;
  }

  const applySelection = (group: AttributeSelectionGroup, value: string) => {
    const nextSelections = resolveAttributeSelections(
      variants,
      groups,
      {
        ...selections,
        [group.attributeId]: value,
      },
      group.attributeId
    );

    const matchedVariant = resolveVariantForSelection(variants, groups, nextSelections);
    if (matchedVariant) {
      onSelectVariant(matchedVariant);
    }
  };

  const renderSecondaryGroup = (group: AttributeSelectionGroup) => {
    const selectedValue = selections[group.attributeId];

    return (
      <div key={group.attributeId} className="product-variant-secondary-row">
        <AttributeRowHead name={group.name} selectedValue={selectedValue} />

        <div className="product-inline-variant-row__options">
          {group.options.map((option) => {
            const isSelected = selectedValue === option.value;
            const isDisabled = !isOptionCompatible(group, option);

            return (
              <SecondaryAttributeOption
                key={`${group.attributeId}-${option.value}`}
                option={option}
                isSelected={isSelected}
                isDisabled={isDisabled}
                onSelect={() => {
                  if (!isDisabled) applySelection(group, option.value);
                }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="product-grouped-variants product-inline-variants">
      <div className="product-variation-head">
        <Sparkles size={15} color="var(--text-saffron)" />
        <h3 className="product-variation-title">Choose Options</h3>
      </div>

      {primaryGroups.length > 0 && (
        <div className="product-variant-primary-section">
          {primaryGroups.map((group) => {
            const selectedValue = selections[group.attributeId];

            return (
              <div key={group.attributeId} className="product-variant-primary-row">
                <AttributeRowHead name={group.name} selectedValue={selectedValue} />

                <div className="product-variant-primary-options">
                  {group.options.map((option) => {
                    const isSelected = selectedValue === option.value;
                    const isDisabled = !isOptionCompatible(group, option);

                    return (
                      <PrimaryAttributeOption
                        key={`${group.attributeId}-${option.value}`}
                        option={option}
                        isSelected={isSelected}
                        isDisabled={isDisabled}
                        onSelect={() => {
                          if (!isDisabled) applySelection(group, option.value);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {secondaryGroups.length > 0 && (
        <div className="product-variant-secondary-section">
          {secondaryGroups.map((group) => renderSecondaryGroup(group))}
        </div>
      )}
    </div>
  );
}
