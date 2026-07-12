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

export type StoreCategoryOption = {
  id: number;
  name: string;
  slug: string;
};

export type StoreFilterState = {
  minPrice: number;
  maxPrice: number;
  sortBy: string;
  newArrivals: boolean;
  featured: boolean;
  bestDeals: boolean;
  categoryIds: number[];
};

type StoreFiltersSidebarProps = {
  categories: StoreCategoryOption[];
  priceBounds: { min: number; max: number };
  sortOptions: Array<{ value: string; label: string }>;
  value: StoreFilterState;
  onChange: (next: StoreFilterState) => void;
  onClear: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export function StoreFiltersSidebar({
  categories,
  priceBounds,
  sortOptions,
  value,
  onChange,
  onClear,
  mobileOpen,
  onCloseMobile,
}: StoreFiltersSidebarProps) {
  const priceId = useId();
  const [draftMin, setDraftMin] = useState(value.minPrice);
  const [draftMax, setDraftMax] = useState(value.maxPrice);

  useEffect(() => {
    setDraftMin(value.minPrice);
    setDraftMax(value.maxPrice);
  }, [value.minPrice, value.maxPrice]);

  const activeCount = useMemo(() => {
    let count = 0;
    if (value.categoryIds.length) count += value.categoryIds.length;
    if (value.newArrivals) count += 1;
    if (value.featured) count += 1;
    if (value.bestDeals) count += 1;
    if (value.minPrice > priceBounds.min || value.maxPrice < priceBounds.max) count += 1;
    if (value.sortBy && value.sortBy !== "newest") count += 1;
    return count;
  }, [value, priceBounds]);

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
    const exists = value.categoryIds.includes(id);
    onChange({
      ...value,
      categoryIds: exists
        ? value.categoryIds.filter((item) => item !== id)
        : [...value.categoryIds, id],
    });
  };

  const content = (
    <aside className="store-filters">
      <div className="store-filters__head">
        <div className="store-filters__title-row">
          <SlidersHorizontal size={18} />
          <h2>Filters</h2>
          {activeCount > 0 && <span className="store-filters__count">{activeCount}</span>}
        </div>
        <div className="store-filters__head-actions">
          {activeCount > 0 && (
            <button type="button" className="store-filters__clear" onClick={onClear}>
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
            onChange={(event) => onChange({ ...value, sortBy: event.target.value })}
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
        <label className="store-filters__check">
          <input
            type="checkbox"
            checked={value.newArrivals}
            onChange={(event) =>
              onChange({ ...value, newArrivals: event.target.checked })
            }
          />
          <span>New Arrivals</span>
        </label>
        <label className="store-filters__check">
          <input
            type="checkbox"
            checked={value.featured}
            onChange={(event) =>
              onChange({ ...value, featured: event.target.checked })
            }
          />
          <span>Featured Products</span>
        </label>
        <label className="store-filters__check">
          <input
            type="checkbox"
            checked={value.bestDeals}
            onChange={(event) =>
              onChange({ ...value, bestDeals: event.target.checked })
            }
          />
          <span>Best Deals</span>
        </label>
      </section>

      <section className="store-filters__section">
        <h3>
          <Grid2X2 size={16} />
          Product Categories
        </h3>
        <div className="store-filters__categories">
          {categories.length === 0 && (
            <p className="store-filters__empty">No categories available.</p>
          )}
          {categories.map((category) => (
            <label key={category.id} className="store-filters__check">
              <input
                type="checkbox"
                checked={value.categoryIds.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
              />
              <span>{category.name}</span>
            </label>
          ))}
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
