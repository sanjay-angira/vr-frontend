"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  ChevronDown,
  Grid2X2,
  ListFilter,
  SlidersHorizontal,
  Tag,
  X,
} from "lucide-react";
import {
  buildCategoryTree,
  countTopLevelCategorySelections,
  toggleCategorySelection,
  type CategoryFilterNode,
} from "@/utils/categoryFilterHelpers";

export type StoreCategoryOption = {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  description?: string | null;
};

export type StoreProductSectionOption = {
  slug: string;
  title: string;
  type?: string;
};

export type StoreFilterState = {
  minPrice: number;
  maxPrice: number;
  sortBy: string;
  categoryIds: number[];
  sectionSlugs: string[];
};

type StoreFiltersSidebarProps = {
  categories: StoreCategoryOption[];
  productSections: StoreProductSectionOption[];
  priceBounds: { min: number; max: number };
  sortOptions: Array<{ value: string; label: string }>;
  value: StoreFilterState;
  onChange: (next: StoreFilterState) => void;
  onClear: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  /** Hide category checkboxes on `/category/[slug]` (path is the category) */
  hideCategories?: boolean;
};

function CategoryTreeChecks({
  nodes,
  depth,
  selectedIds,
  onToggle,
}: {
  nodes: CategoryFilterNode[];
  depth: number;
  selectedIds: number[];
  onToggle: (id: number) => void;
}) {
  return (
    <>
      {nodes.map((node) => (
        <div key={node.id} className="store-filters__category-node">
          <label
            className="store-filters__check"
            style={{ paddingLeft: depth * 1.1 + "rem" }}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(node.id)}
              onChange={() => onToggle(node.id)}
            />
            <span>{node.name}</span>
          </label>
          {node.children.length > 0 && (
            <CategoryTreeChecks
              nodes={node.children}
              depth={depth + 1}
              selectedIds={selectedIds}
              onToggle={onToggle}
            />
          )}
        </div>
      ))}
    </>
  );
}

export function StoreFiltersSidebar({
  categories,
  productSections,
  priceBounds,
  sortOptions,
  value,
  onChange,
  onClear,
  mobileOpen,
  onCloseMobile,
  hideCategories = false,
}: StoreFiltersSidebarProps) {
  const priceId = useId();
  const [draftMin, setDraftMin] = useState(value.minPrice);
  const [draftMax, setDraftMax] = useState(value.maxPrice);

  useEffect(() => {
    setDraftMin(value.minPrice);
    setDraftMax(value.maxPrice);
  }, [value.minPrice, value.maxPrice]);

  const categoryTree = useMemo(
    () => buildCategoryTree(categories),
    [categories]
  );

  const activeCount = useMemo(() => {
    let count = 0;
    if (!hideCategories) {
      count += countTopLevelCategorySelections(value.categoryIds, categories);
    }
    if (value.sectionSlugs.length) count += value.sectionSlugs.length;
    if (value.minPrice > priceBounds.min || value.maxPrice < priceBounds.max)
      count += 1;
    if (value.sortBy && value.sortBy !== "newest") count += 1;
    return count;
  }, [value, priceBounds, categories, hideCategories]);

  const commitPrice = () => {
    const min = Math.min(draftMin, draftMax);
    const max = Math.max(draftMin, draftMax);
    onChange({
      ...value,
      minPrice: Math.max(priceBounds.min, min),
      maxPrice: Math.min(priceBounds.max, max),
    });
  };

  const toggleCategory = (id: number) => {
    onChange({
      ...value,
      categoryIds: toggleCategorySelection(id, value.categoryIds, categories),
    });
  };

  const toggleSection = (slug: string) => {
    const exists = value.sectionSlugs.includes(slug);
    onChange({
      ...value,
      sectionSlugs: exists
        ? value.sectionSlugs.filter((item) => item !== slug)
        : [...value.sectionSlugs, slug],
    });
  };

  const content = (
    <aside className="store-filters">
      <div className="store-filters__head">
        <div className="store-filters__title-row">
          <SlidersHorizontal size={18} />
          <h2>Filters</h2>
          {activeCount > 0 && (
            <span className="store-filters__count">{activeCount}</span>
          )}
        </div>
        <div className="store-filters__head-actions">
          {activeCount > 0 && (
            <button
              type="button"
              className="store-filters__clear"
              onClick={onClear}
            >
              Clear
            </button>
          )}
          <button
            type="button"
            className="store-filters__close"
            onClick={onCloseMobile}
            aria-label="Close filters"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <section className="store-filters__section">
        <h3>
          <Tag size={16} />
          Price
        </h3>
        <div className="store-filters__price-inputs">
          <label htmlFor={`${priceId}-min`}>
            <span>Min</span>
            <input
              id={`${priceId}-min`}
              type="number"
              min={priceBounds.min}
              max={priceBounds.max}
              value={draftMin}
              onChange={(event) => setDraftMin(Number(event.target.value) || 0)}
              onBlur={commitPrice}
            />
          </label>
          <label htmlFor={`${priceId}-max`}>
            <span>Max</span>
            <input
              id={`${priceId}-max`}
              type="number"
              min={priceBounds.min}
              max={priceBounds.max}
              value={draftMax}
              onChange={(event) => setDraftMax(Number(event.target.value) || 0)}
              onBlur={commitPrice}
            />
          </label>
        </div>
        <input
          className="store-filters__range"
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          value={draftMax}
          onChange={(event) => setDraftMax(Number(event.target.value))}
          onMouseUp={commitPrice}
          onTouchEnd={commitPrice}
          aria-label="Maximum price"
        />
        <p className="store-filters__price-label">
          ₹{Math.min(draftMin, draftMax).toLocaleString("en-IN")} To ₹
          {Math.max(draftMin, draftMax).toLocaleString("en-IN")}
        </p>
      </section>

      <section className="store-filters__section">
        <h3>
          <ListFilter size={16} />
          Sort By
        </h3>
        <div className="store-filters__select-wrap">
          <select
            value={value.sortBy}
            onChange={(event) =>
              onChange({ ...value, sortBy: event.target.value })
            }
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} />
        </div>
      </section>

      <section className="store-filters__section">
        <h3>
          <ListFilter size={16} />
          Product Status
        </h3>
        {productSections.length === 0 && (
          <p className="store-filters__empty">No product sections available.</p>
        )}
        {productSections.map((section) => (
          <label key={section.slug} className="store-filters__check">
            <input
              type="checkbox"
              checked={value.sectionSlugs.includes(section.slug)}
              onChange={() => toggleSection(section.slug)}
            />
            <span>{section.title}</span>
          </label>
        ))}
      </section>

      {!hideCategories && (
        <section className="store-filters__section">
          <h3>
            <Grid2X2 size={16} />
            Product Categories
          </h3>
          <div className="store-filters__categories">
            {categoryTree.length === 0 && (
              <p className="store-filters__empty">No categories available.</p>
            )}
            <CategoryTreeChecks
              nodes={categoryTree}
              depth={0}
              selectedIds={value.categoryIds}
              onToggle={toggleCategory}
            />
          </div>
        </section>
      )}
    </aside>
  );

  return (
    <>
      <div className="store-filters__desktop">{content}</div>
      {mobileOpen && (
        <div className="store-filters__drawer" role="dialog" aria-modal="true">
          <button
            type="button"
            className="store-filters__backdrop"
            aria-label="Close filters"
            onClick={onCloseMobile}
          />
          {content}
        </div>
      )}
    </>
  );
}
