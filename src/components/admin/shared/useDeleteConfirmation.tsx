"use client";

import { useCallback, useState } from "react";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

type UseDeleteConfirmationOptions<T> = {
  onConfirm: (item: T) => void | Promise<void>;
  title?: string;
  getMessage?: (item: T) => string;
};

export function useDeleteConfirmation<T>({
  onConfirm,
  title = "Confirm deletion",
  getMessage,
}: UseDeleteConfirmationOptions<T>) {
  const [pending, setPending] = useState<T | null>(null);
  const [message, setMessage] = useState<string>();
  const [isDeleting, setIsDeleting] = useState(false);

  const requestDelete = useCallback((item: T, customMessage?: string) => {
    setPending(item);
    setMessage(customMessage);
  }, []);

  const cancel = useCallback(() => {
    if (isDeleting) return;
    setPending(null);
    setMessage(undefined);
  }, [isDeleting]);

  const confirm = useCallback(async () => {
    if (!pending) return;

    setIsDeleting(true);
    try {
      await onConfirm(pending);
      setPending(null);
      setMessage(undefined);
    } finally {
      setIsDeleting(false);
    }
  }, [onConfirm, pending]);

  const modal =
    pending !== null ? (
      <DeleteConfirmationModal
        title={title}
        message={
          message ??
          getMessage?.(pending) ??
          "Are you sure you want to delete this item? This action cannot be undone."
        }
        onCancel={cancel}
        onConfirm={confirm}
        isDeleting={isDeleting}
      />
    ) : null;

  return { requestDelete, modal, isDeleting, cancel };
}
