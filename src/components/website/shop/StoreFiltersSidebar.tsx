"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  Grid2X2,
  ListFilter,
  Percent,
  SlidersHorizontal,
  Star,
  Tag,
  X,
} from "lucide-react";
import {
  buildCategoryTree,
  buildFocusedCategoryTree,
  countTopLevelCategorySelections,
  toggleCategorySelection,
  type CategoryFilterNode,
} from "@/utils/categoryFilterHelpers";
import { DISCOUNT_FILTER_OPTIONS } from "@/utils/shopFilterUrl";

export type StoreCategoryOption = {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  description?: string | null;
  image?: string | null;
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
  minRating: number | null;
  minDiscount: number | null;
};

export const RATING_FILTER_OPTIONS = [4, 3, 2, 1] as const;

type StoreFiltersSidebarProps = {
  categories: StoreCategoryOption[];
  productSections: StoreProductSectionOption[];
  priceBounds: { min: number; max: number };
  value: StoreFilterState;
  onChange: (next: StoreFilterState) => void;
  onClear: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  /** On `/category/[slug]`, show parent + children of this category */
  activeCategorySlug?: string;
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

function CategoryContextLinks({
  nodes,
  depth,
  activeSlug,
}: {
  nodes: CategoryFilterNode[];
  depth: number;
  activeSlug: string;
}) {
  const current = activeSlug.trim().toLowerCase();

  return (
    <>
      {nodes.map((node) => {
        const isCurrent = node.slug.trim().toLowerCase() === current;
        return (
          <div key={node.id} className="store-filters__category-node">
            {isCurrent ? (
              <span
                className="store-filters__category-link is-current"
                style={{ paddingLeft: depth * 1.1 + "rem" }}
                aria-current="page"
              >
                {node.name}
              </span>
            ) : (
              <Link
                href={`/category/${encodeURIComponent(node.slug)}`}
                className="store-filters__category-link"
                style={{ paddingLeft: depth * 1.1 + "rem" }}
              >
                {node.name}
              </Link>
            )}
            {node.children.length > 0 && (
              <CategoryContextLinks
                nodes={node.children}
                depth={depth + 1}
                activeSlug={activeSlug}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

export function StoreFiltersSidebar({
  categories,
  productSections,
  priceBounds,
  value,
  onChange,
  onClear,
  mobileOpen,
  onCloseMobile,
  activeCategorySlug,
}: StoreFiltersSidebarProps) {
  const priceId = useId();
  const [draftMin, setDraftMin] = useState(value.minPrice);
  const [draftMax, setDraftMax] = useState(value.maxPrice);

  useEffect(() => {
    setDraftMin(value.minPrice);
    setDraftMax(value.maxPrice);
  }, [value.minPrice, value.maxPrice]);

  const focusedSlug = activeCategorySlug?.trim().toLowerCase() || "";
  const categoryTree = useMemo(
    () =>
      focusedSlug
        ? buildFocusedCategoryTree(categories, focusedSlug)
        : buildCategoryTree(categories),
    [categories, focusedSlug]
  );

  const activeCount = useMemo(() => {
    let count = 0;
    if (!focusedSlug) {
      count += countTopLevelCategorySelections(value.categoryIds, categories);
    }
    if (value.sectionSlugs.length) count += value.sectionSlugs.length;
    if (value.minRating) count += 1;
    if (value.minDiscount) count += 1;
    if (value.minPrice > priceBounds.min || value.maxPrice < priceBounds.max)
      count += 1;
    return count;
  }, [value, priceBounds, categories, focusedSlug]);

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

  const selectRating = (stars: number) => {
    onChange({
      ...value,
      minRating: value.minRating === stars ? null : stars,
    });
  };

  const selectDiscount = (percent: number) => {
    onChange({
      ...value,
      minDiscount: value.minDiscount === percent ? null : percent,
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
          <Star size={16} />
          Rating
        </h3>
        <div className="store-filters__rating">
          {RATING_FILTER_OPTIONS.map((stars) => {
            const selected = value.minRating === stars;
            return (
              <label
                key={stars}
                className={`store-filters__rating-option${selected ? " is-active" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => selectRating(stars)}
                />
                <span className="store-filters__rating-stars" aria-hidden>
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className={`store-filters__rating-star${
                        index < stars ? " is-filled" : ""
                      }`}
                    />
                  ))}
                </span>
                <span>
                  {stars} Star{stars === 1 ? "" : "s"} & Up
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="store-filters__section">
        <h3>
          <Percent size={16} />
          Discount
        </h3>
        {DISCOUNT_FILTER_OPTIONS.map((percent) => (
          <label key={percent} className="store-filters__check">
            <input
              type="checkbox"
              checked={value.minDiscount === percent}
              onChange={() => selectDiscount(percent)}
            />
            <span>{percent}% or more</span>
          </label>
        ))}
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

      <section className="store-filters__section">
        <h3>
          <Grid2X2 size={16} />
          Product Categories
        </h3>
        <div className="store-filters__categories">
          {categoryTree.length === 0 && (
            <p className="store-filters__empty">No categories available.</p>
          )}
          {focusedSlug ? (
            <CategoryContextLinks
              nodes={categoryTree}
              depth={0}
              activeSlug={focusedSlug}
            />
          ) : (
            <CategoryTreeChecks
              nodes={categoryTree}
              depth={0}
              selectedIds={value.categoryIds}
              onToggle={toggleCategory}
            />
          )}
        </div>
      </section>
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
