"use client";

import { X } from "lucide-react";
import { Button } from "@/components/common/Button";

type AdminModalProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  size?: "md" | "lg";
  bodyClassName?: string;
};

export function AdminModal({
  title,
  description,
  children,
  onClose,
  onSubmit,
  submitLabel = "Save",
  isSubmitting,
  size = "md",
  bodyClassName,
}: AdminModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl ${
          size === "lg" ? "max-w-2xl" : "max-w-lg"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 rounded-t-xl bg-admin-primary px-5 py-4 text-white">
          <div className="min-w-0">
            <h2 id="admin-modal-title" className="text-lg font-semibold">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-white/80">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className={`flex-1 p-5 ${bodyClassName ?? "overflow-y-auto"}`}
        >
          {children}
        </div>

        {onSubmit && (
          <div className="flex justify-end gap-3 border-t border-zinc-100 bg-zinc-50/80 px-5 py-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
