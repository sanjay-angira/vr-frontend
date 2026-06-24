"use client";

import { CloudUpload, Loader2, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/common/Button";
import {
  deleteUploadedFile,
  deleteUploadedVideo,
  uploadFile,
} from "@/services/api/uploadService";
import { resolveImageUrl } from "./resolveImageUrl";
import { FormLabel } from "./FormLabel";

const UPLOAD_TRIGGER_CLASS =
  "flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-admin-primary/40 bg-admin-primary/5 px-3.5 py-2.5 text-sm font-medium text-admin-primary transition-colors hover:bg-admin-primary/10";

const IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/webp",
  "image/svg+xml",
  "image/tiff",
  "image/heic",
  "image/heif",
];


type ImageUploadModalProps = {
  uploadPath: string;
  accept: string;
  mediaType: "image" | "video";
  onClose: () => void;
  onUploaded: (url: string) => void;
};

function ImageUploadModal({
  uploadPath,
  accept,
  mediaType,
  onClose,
  onUploaded,
}: ImageUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (mediaType === "image" && !IMAGE_TYPES.includes(file.type)) {
      setError("Only image files are allowed.");
      return;
    }

    setError("");
    setFileName(file.name);
    setSelectedFile(file);

    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    if (mediaType === "image") {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl("");
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    setUploading(true);
    setError("");
    setProgress(0);

    try {
      const result = await uploadFile(selectedFile, uploadPath, setProgress);
      onUploaded(result.Location);
      onClose();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Failed to upload file."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between bg-admin-primary px-5 py-4 text-white">
          <h2 className="text-lg font-semibold">
            Upload {mediaType === "image" ? "Image" : "Video"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 transition-colors hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {!selectedFile ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-admin-primary/40 bg-admin-primary/5 px-4 py-8 text-sm font-medium text-admin-primary transition-colors hover:bg-admin-primary/10"
            >
              <CloudUpload className="h-5 w-5" />
              Add attachment
            </button>
          ) : previewUrl ? (
            <div className="overflow-hidden rounded-lg border border-zinc-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Selected preview"
                className="max-h-72 w-full object-contain"
              />
            </div>
          ) : (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600">
              {fileName} is ready to upload.
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFileChange}
          />

          {progress > 0 && uploading && (
            <div className="space-y-1">
              <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full bg-admin-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500">{progress}% uploaded</p>
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-center gap-3 border-t border-zinc-100 px-5 py-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleUpload} disabled={uploading || !selectedFile}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

type BaseUploadFieldProps = {
  label: string;
  uploadPath: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  mediaType?: "image" | "video";
};

type SingleImageUploadFieldProps = BaseUploadFieldProps & {
  value: string;
  onChange: (url: string) => void;
};

export function ImageUploadField({
  label,
  value,
  onChange,
  uploadPath,
  required,
  error,
  hint,
  className,
  mediaType = "image",
}: SingleImageUploadFieldProps) {
  const inputId = useId();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  const accept = mediaType === "video" ? "video/*" : "image/*";
  const displayError = error || actionError;

  async function handleDelete() {
    if (!value) return;

    setDeleting(true);
    setActionError("");

    try {
      if (mediaType === "video") {
        await deleteUploadedVideo(value, uploadPath);
      } else {
        await deleteUploadedFile(value, uploadPath);
      }
      onChange("");
    } catch {
      setActionError("Failed to delete file. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className={className}>
      <FormLabel label={label} required={required} htmlFor={inputId} />

      {value ? (
        <div className="space-y-3">
          <div className="relative inline-block">
            <div className="overflow-hidden rounded-lg border border-zinc-200 shadow-sm">
              {mediaType === "video" ? (
                <video
                  src={resolveImageUrl(value)}
                  controls
                  className="h-32 w-auto max-w-full bg-black"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={resolveImageUrl(value)}
                  alt={label}
                  className="h-32 w-32 object-cover"
                />
              )}
            </div>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow disabled:opacity-60"
              aria-label={`Remove ${label}`}
            >
              {deleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <X className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-sm font-medium text-admin-primary hover:underline"
          >
            Replace {mediaType === "video" ? "video" : "image"}
          </button>
        </div>
      ) : (
        <button
          id={inputId}
          type="button"
          onClick={() => setModalOpen(true)}
          className={UPLOAD_TRIGGER_CLASS}
        >
          <CloudUpload className="h-4 w-4" />
          Upload {mediaType === "video" ? "Video" : "Image"}
        </button>
      )}

      {displayError && <p className="mt-1.5 text-sm text-red-600">{displayError}</p>}
      {hint && !displayError && <p className="mt-1.5 text-sm text-zinc-500">{hint}</p>}

      {modalOpen && (
        <ImageUploadModal
          uploadPath={uploadPath}
          accept={accept}
          mediaType={mediaType}
          onClose={() => setModalOpen(false)}
          onUploaded={onChange}
        />
      )}
    </div>
  );
}

type MultiImageUploadFieldProps = BaseUploadFieldProps & {
  values: string[];
  onChange: (urls: string[]) => void;
};

export function MultiImageUploadField({
  label,
  values,
  onChange,
  uploadPath,
  required,
  error,
  hint,
  className,
}: MultiImageUploadFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const displayError = error || actionError;

  async function handleRemove(url: string) {
    setDeletingUrl(url);
    setActionError("");

    try {
      await deleteUploadedFile(url, uploadPath);
      onChange(values.filter((item) => item !== url));
    } catch {
      setActionError("Failed to delete image. Please try again.");
    } finally {
      setDeletingUrl(null);
    }
  }

  function handleAdd(url: string) {
    onChange([...values, url]);
  }

  return (
    <div className={`md:col-span-2 ${className ?? ""}`}>
      <FormLabel label={label} required={required} />

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={UPLOAD_TRIGGER_CLASS}
      >
        <CloudUpload className="h-4 w-4" />
        Upload Image
      </button>

      {values.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4">
          {values.map((image, index) => (
            <div key={`${image}-${index}`} className="relative w-28">
              <div className="overflow-hidden rounded-lg border border-zinc-200 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImageUrl(image)}
                  alt={label}
                  className="h-28 w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(image)}
                disabled={deletingUrl === image}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow disabled:opacity-60"
                aria-label="Remove image"
              >
                {deletingUrl === image ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <X className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {displayError && <p className="mt-1.5 text-sm text-red-600">{displayError}</p>}
      {hint && !displayError && <p className="mt-1.5 text-sm text-zinc-500">{hint}</p>}

      {modalOpen && (
        <ImageUploadModal
          uploadPath={uploadPath}
          accept="image/*"
          mediaType="image"
          onClose={() => setModalOpen(false)}
          onUploaded={(url) => {
            handleAdd(url);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
