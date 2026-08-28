"use client";

import { useEffect, useState } from "react";
import { ArrowUpDown, Check, SlidersHorizontal, X } from "lucide-react";

type SortOption = {
  value: string;
  label: string;
};

type StoreMobileToolsProps = {
  sortOptions: SortOption[];
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  onOpenFilters: () => void;
};

const DISPLAY_LABELS: Record<string, string> = {
  newest: "Newest First",
  price_asc: "Price -- Low to High",
  price_desc: "Price -- High to Low",
  name_asc: "Name: A to Z",
  discount_desc: "Best Discount",
};

export function StoreMobileTools({
  sortOptions,
  sortBy,
  onSortChange,
  onOpenFilters,
}: StoreMobileToolsProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const activeLabel =
    DISPLAY_LABELS[sortBy] ||
    sortOptions.find((option) => option.value === sortBy)?.label ||
    "Sort";

  useEffect(() => {
    if (!sortOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSortOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [sortOpen]);

  if (!sortOptions.length) return null;

  return (
    <>
      <div className="store-mobile-split">
        <button
          type="button"
          className="store-mobile-split__btn"
          aria-expanded={sortOpen}
          onClick={() => setSortOpen(true)}
        >
          <ArrowUpDown size={16} aria-hidden />
          <span>Sort</span>
        </button>
        <button
          type="button"
          className="store-mobile-split__btn"
          onClick={onOpenFilters}
        >
          <SlidersHorizontal size={16} aria-hidden />
          <span>Filters</span>
        </button>
      </div>

      {sortOpen ? (
        <div className="store-sort-sheet" role="dialog" aria-modal="true" aria-label="Sort products">
          <button
            type="button"
            className="store-sort-sheet__backdrop"
            aria-label="Close sort options"
            onClick={() => setSortOpen(false)}
          />
          <div className="store-sort-sheet__panel">
            <div className="store-sort-sheet__head">
              <h2>Sort By</h2>
              <button
                type="button"
                className="icon-button"
                aria-label="Close sort options"
                onClick={() => setSortOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <p className="store-sort-sheet__current">{activeLabel}</p>
            <ul className="store-sort-sheet__list">
              {sortOptions.map((option) => {
                const active = option.value === sortBy;
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      className={`store-sort-sheet__option${active ? " is-active" : ""}`}
                      onClick={() => {
                        onSortChange(option.value);
                        setSortOpen(false);
                      }}
                    >
                      <span>{DISPLAY_LABELS[option.value] || option.label}</span>
                      {active ? <Check size={16} aria-hidden /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
