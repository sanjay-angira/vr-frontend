"use client";

import { Eye, EyeOff } from "lucide-react";
import { InputHTMLAttributes, forwardRef, useId, useState } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  showPasswordToggle?: boolean;
};

const COLOR_INPUT_CLASS =
  "h-[42px] cursor-pointer appearance-none p-1 bg-white " +
  "[&::-webkit-color-swatch-wrapper]:h-full [&::-webkit-color-swatch-wrapper]:w-full [&::-webkit-color-swatch-wrapper]:p-0 " +
  "[&::-webkit-color-swatch]:h-full [&::-webkit-color-swatch]:w-full [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0 " +
  "[&::-moz-color-swatch]:h-full [&::-moz-color-swatch]:w-full [&::-moz-color-swatch]:rounded-md [&::-moz-color-swatch]:border-0";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      required,
      error,
      hint,
      className = "",
      id,
      type,
      showPasswordToggle = false,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPasswordField = type === "password";
    const isColorField = type === "color";
    const canTogglePassword = isPasswordField && showPasswordToggle;
    const inputType = canTogglePassword && isPasswordVisible ? "text" : type;

    const borderClass = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
      : "border-zinc-300";

    const inputClassName = [
      "w-full rounded-lg border text-sm transition-colors focus:border-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/15",
      borderClass,
      isColorField
        ? COLOR_INPUT_CLASS
        : "bg-white px-3.5 py-2.5 text-zinc-900 placeholder:text-zinc-400",
      canTogglePassword ? "pr-11" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-zinc-700"
          >
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={inputClassName}
            {...props}
          />

          {canTogglePassword && (
            <button
              type="button"
              onClick={() => setIsPasswordVisible((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-700"
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            >
              {isPasswordVisible ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-zinc-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
