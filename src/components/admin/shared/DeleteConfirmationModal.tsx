"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/common/Button";

type DeleteConfirmationModalProps = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
};

export function DeleteConfirmationModal({
  title = "Confirm deletion",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onCancel,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(event) => {
        if (!isDeleting && event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-confirmation-title"
        aria-describedby="delete-confirmation-message"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2
                id="delete-confirmation-title"
                className="text-lg font-semibold text-zinc-900"
              >
                {title}
              </h2>
              <p
                id="delete-confirmation-message"
                className="mt-2 text-sm leading-relaxed text-zinc-600"
              >
                {message}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isDeleting}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus-visible:outline-red-600"
            >
              {isDeleting ? "Deleting..." : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
