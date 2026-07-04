"use client";

import { ChevronDown, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { DropdownOption } from "./FormDropdown";
import { FormLabel } from "./FormLabel";

type FormMultiDropdownProps = {
  label: string;
  value: Array<string | number>;
  onChange: (value: number[]) => void;
  onBlur?: () => void;
  options: DropdownOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
};

export function FormMultiDropdown({
  label,
  value,
  onChange,
  onBlur,
  options,
  placeholder = "Select...",
  required,
  error,
  hint,
  disabled,
  className,
}: FormMultiDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const onBlurRef = useRef(onBlur);
  const listId = useId();

  const selectedValues = value.map(String);
  const selectedOptions = options.filter((option) =>
    selectedValues.includes(String(option.value))
  );

  useEffect(() => {
    onBlurRef.current = onBlur;
  }, [onBlur]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;

      setOpen(false);
      onBlurRef.current?.();
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [open]);

  function toggleOption(optionValue: string | number) {
    const key = String(optionValue);
    const num = Number(optionValue);

    if (selectedValues.includes(key)) {
      onChange(value.filter((item) => String(item) !== key).map((item) => Number(item)));
      return;
    }

    onChange([...value.map((item) => Number(item)), num]);
  }

  function removeOption(optionValue: string | number) {
    toggleOption(optionValue);
  }

  return (
    <div className={`relative ${className ?? ""}`} ref={rootRef}>
      <FormLabel label={label} required={required} />

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
          }
        }}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((prev) => !prev);
          }
        }}
        className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3.5 py-2 text-left text-sm transition-colors focus:border-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/15 ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        } ${error ? "border-red-500" : "border-zinc-300"}`}
      >
        <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {selectedOptions.length === 0 ? (
            <span className="text-zinc-400">{placeholder}</span>
          ) : (
            selectedOptions.map((option) => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700"
              >
                {option.label}
                <button
                  type="button"
                  disabled={disabled}
                  className="rounded-full p-0.5 hover:bg-zinc-200 disabled:pointer-events-none"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeOption(option.value);
                  }}
                  aria-label={`Remove ${option.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
        >
          {options.length === 0 ? (
            <li className="px-3.5 py-2.5 text-sm text-zinc-400">No options available</li>
          ) : (
            options.map((option) => {
              const isSelected = selectedValues.includes(String(option.value));
              return (
                <li key={option.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-zinc-50 ${
                      isSelected ? "bg-admin-primary/5 text-admin-primary" : "text-zinc-700"
                    }`}
                    onClick={() => toggleOption(option.value)}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        isSelected
                          ? "border-admin-primary bg-admin-primary text-white"
                          : "border-zinc-300 bg-white"
                      }`}
                    >
                      {isSelected ? "✓" : ""}
                    </span>
                    {option.label}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}

      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-sm text-zinc-500">{hint}</p>}
    </div>
  );
}
