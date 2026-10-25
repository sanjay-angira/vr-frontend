import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
  fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      isLoading = false,
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      primary:
        "bg-[#c59d5f] text-white hover:bg-[#a67c3d] focus-visible:outline-[#c59d5f]",
      secondary:
        "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100 focus-visible:outline-[#c59d5f]",
      ghost: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
