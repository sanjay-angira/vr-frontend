"use client";

type SortOption = {
  value: string;
  label: string;
};

type StoreSortBarProps = {
  options: SortOption[];
  value: string;
  onChange: (sortBy: string) => void;
};

const DISPLAY_LABELS: Record<string, string> = {
  newest: "Newest First",
  price_asc: "Price -- Low to High",
  price_desc: "Price -- High to Low",
  name_asc: "Name: A to Z",
  discount_desc: "Best Discount",
};

export function StoreSortBar({ options, value, onChange }: StoreSortBarProps) {
  if (!options.length) return null;

  return (
    <div className="store-sort-bar" role="toolbar" aria-label="Sort products">
      <span className="store-sort-bar__label">Sort By</span>
      <div className="store-sort-bar__options">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              className={`store-sort-bar__option${active ? " is-active" : ""}`}
              aria-pressed={active}
              onClick={() => {
                if (!active) onChange(option.value);
              }}
            >
              {DISPLAY_LABELS[option.value] || option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
