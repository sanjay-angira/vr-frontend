"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { FormLabel } from "./FormLabel";

export type DropdownOption = {
  label: string;
  value: string | number;
};

type FormDropdownProps = {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: DropdownOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
};

export function FormDropdown({
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
}: FormDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const onBlurRef = useRef(onBlur);
  const listId = useId();

  const selected = options.find((option) => String(option.value) === String(value));

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

  return (
    <div className={`relative ${className ?? ""}`} ref={rootRef}>
      <FormLabel label={label} required={required} />

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-lg border bg-white px-3.5 py-2.5 text-left text-sm transition-colors focus:border-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/15 disabled:cursor-not-allowed disabled:opacity-60 ${
          error ? "border-red-500" : "border-zinc-300"
        }`}
      >
        <span className={selected ? "text-zinc-900" : "text-zinc-400"}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
        >
          {options.length === 0 ? (
            <li className="px-3.5 py-2.5 text-sm text-zinc-400">No options available</li>
          ) : (
            options.map((option) => {
              const isSelected = String(option.value) === String(value);
              return (
                <li key={option.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    className={`flex w-full px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-zinc-50 ${
                      isSelected ? "bg-admin-primary/5 font-medium text-admin-primary" : "text-zinc-700"
                    }`}
                    onClick={() => {
                      onChange(String(option.value));
                      setOpen(false);
                      onBlur?.();
                    }}
                  >
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
