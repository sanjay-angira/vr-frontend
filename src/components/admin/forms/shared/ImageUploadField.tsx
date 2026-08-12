"use client";

import { CloudUpload, ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/common/Button";
import {
  deleteUploadedFile,
  deleteUploadedVideo,
  uploadFile,
  type S3UploadResult,
} from "@/services/api/uploadService";
import { resolveImageUrl } from "./resolveImageUrl";
import { FormLabel } from "./FormLabel";
import type { ImageOptimizationType, OptimizedImageColumns } from "@/utils/optimizedImage";
import { columnsFromUploadResult } from "@/utils/optimizedImage";
import {
  forgetImageSizes,
  getRememberedImageSizes,
  rememberImageSizes,
} from "@/utils/imageSizesCache";

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
  imageType?: ImageOptimizationType;
  entityId?: string | number;
  onClose: () => void;
  onUploaded: (result: S3UploadResult) => void;
};

function ImageUploadModal({
  uploadPath,
  accept,
  mediaType,
  imageType,
  entityId,
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

  function resetModalState() {
    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setFileName("");
    setSelectedFile(null);
    setProgress(0);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleClose() {
    if (uploading) return;
    resetModalState();
    window.setTimeout(() => onClose(), 0);
  }

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
      const result = await uploadFile(selectedFile, {
        path: uploadPath,
        imageType: mediaType === "image" ? imageType : undefined,
        entityId,
        onProgress: setProgress,
      });
      onUploaded(result);
      resetModalState();
      window.setTimeout(() => onClose(), 0);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Failed to upload file."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-admin-primary px-5 py-4 text-white">
          <h2 className="text-lg font-semibold">
            Upload {mediaType === "image" ? "Image" : "Video"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
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
          <Button type="button" variant="secondary" onClick={handleClose} disabled={uploading}>
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
  /** Matches admin Input / dropdown height (42px) for inline form grids */
  variant?: "default" | "compact";
  /** Enables Sharp optimization pipeline on upload. */
  imageType?: ImageOptimizationType;
  entityId?: string | number;
  /** Optional companion field callback for flat optimized columns. */
  onSizesChange?: (sizes: OptimizedImageColumns | null) => void;
};

const COMPACT_FIELD_HEIGHT = "h-[42px]";
const COMPACT_BORDER_CLASS =
  "rounded-lg border border-zinc-300 bg-white transition-colors focus-within:border-admin-primary focus-within:ring-2 focus-within:ring-admin-primary/15";

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
  variant = "default",
  imageType,
  entityId,
  onSizesChange,
}: SingleImageUploadFieldProps) {
  const inputId = useId();
  const uploadKeysRef = useRef<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  const accept = mediaType === "video" ? "video/*" : "image/*";
  const displayError = error || actionError;

  function rememberUploadKey(location: string, key?: string) {
    if (key?.trim()) {
      uploadKeysRef.current[location] = key.trim();
    }
  }

  function forgetUploadKey(location: string) {
    delete uploadKeysRef.current[location];
  }

  async function handleDelete() {
    if (!value) return;

    setDeleting(true);
    setActionError("");

    try {
      const objectKey = uploadKeysRef.current[value];
      const sizes = getRememberedImageSizes(value);
      if (mediaType === "video") {
        await deleteUploadedVideo(value, uploadPath, objectKey);
      } else {
        await deleteUploadedFile(value, uploadPath, objectKey, sizes);
      }
      forgetUploadKey(value);
      forgetImageSizes(value);
      onSizesChange?.(null);
      onChange("");
    } catch (deleteError) {
      setActionError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete file from AWS. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  }

  function handleUploaded(result: S3UploadResult) {
    rememberUploadKey(result.Location, result.Key);
    const columns = columnsFromUploadResult(result);
    rememberImageSizes(result.Location, columns);
    onSizesChange?.(columns);
    onChange(result.Location);
  }

  function openModal() {
    setActionError("");
    setModalOpen(true);
  }

  function closeModal() {
    setActionError("");
    window.setTimeout(() => setModalOpen(false), 0);
  }

  const compactBorderClass = error
    ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/10"
    : "border-zinc-300";

  return (
    <div className={className}>
      <FormLabel label={label} required={required} htmlFor={inputId} />

      {variant === "compact" ? (
        value ? (
          <div
            className={`flex ${COMPACT_FIELD_HEIGHT} w-full items-center gap-1 overflow-hidden ${COMPACT_BORDER_CLASS} ${compactBorderClass} pl-1 pr-1.5`}
          >
            <button
              type="button"
              onClick={openModal}
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
              aria-label={`Replace ${label}`}
            >
              {mediaType === "video" ? (
                <video
                  src={resolveImageUrl(value)}
                  className="h-[34px] w-[34px] shrink-0 rounded-md bg-black object-cover"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={resolveImageUrl(value)}
                  alt={label}
                  className="h-[34px] w-[34px] shrink-0 rounded-md object-cover"
                />
              )}
              <span className="truncate text-sm text-zinc-600">Change image</span>
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-60"
              aria-label={`Remove ${label}`}
            >
              {deleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <X className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        ) : (
          <button
            id={inputId}
            type="button"
            onClick={openModal}
            className={`flex ${COMPACT_FIELD_HEIGHT} w-full items-center justify-center gap-2 border border-dashed text-sm font-medium transition-colors hover:bg-admin-primary/10 ${compactBorderClass} ${
              error
                ? "border-red-500 text-red-600"
                : "border-admin-primary/40 bg-admin-primary/5 text-admin-primary"
            }`}
          >
            <CloudUpload className="h-4 w-4 shrink-0" />
            <span className="truncate">Upload image</span>
          </button>
        )
      ) : value ? (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative shrink-0 self-start">
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
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
                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-transform hover:scale-105 disabled:opacity-60"
                aria-label={`Remove ${label}`}
              >
                {deleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <X className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div>
                <p className="text-sm font-medium text-zinc-800">
                  {mediaType === "video" ? "Current video" : "Current photo"}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Upload a new file to replace the current{" "}
                  {mediaType === "video" ? "video" : "image"}.
                </p>
              </div>

              <button
                type="button"
                onClick={openModal}
                className={`${UPLOAD_TRIGGER_CLASS} sm:w-auto sm:min-w-[11rem]`}
              >
                <ImagePlus className="h-4 w-4" />
                Replace {mediaType === "video" ? "video" : "image"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          id={inputId}
          type="button"
          onClick={openModal}
          className={UPLOAD_TRIGGER_CLASS}
        >
          <CloudUpload className="h-4 w-4" />
          Upload {mediaType === "video" ? "Video" : "Image"}
        </button>
      )}

      {displayError && <p className="mt-1.5 text-sm text-red-600">{displayError}</p>}
      {variant !== "compact" && hint && !displayError && (
        <p className="mt-1.5 text-sm text-zinc-500">{hint}</p>
      )}

      {modalOpen && (
        <ImageUploadModal
          uploadPath={uploadPath}
          accept={accept}
          mediaType={mediaType}
          imageType={imageType}
          entityId={entityId}
          onClose={closeModal}
          onUploaded={handleUploaded}
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
  imageType,
  entityId,
}: MultiImageUploadFieldProps) {
  const uploadKeysRef = useRef<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const displayError = error || actionError;

  function rememberUploadKey(location: string, key?: string) {
    if (key?.trim()) {
      uploadKeysRef.current[location] = key.trim();
    }
  }

  function forgetUploadKey(location: string) {
    delete uploadKeysRef.current[location];
  }

  async function handleRemove(url: string) {
    setDeletingUrl(url);
    setActionError("");

    try {
      await deleteUploadedFile(
        url,
        uploadPath,
        uploadKeysRef.current[url],
        getRememberedImageSizes(url)
      );
      forgetUploadKey(url);
      forgetImageSizes(url);
      onChange(values.filter((item) => item !== url));
    } catch (deleteError) {
      setActionError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete image from AWS. Please try again."
      );
    } finally {
      setDeletingUrl(null);
    }
  }

  function openModal() {
    setActionError("");
    setModalOpen(true);
  }

  function closeModal() {
    setActionError("");
    window.setTimeout(() => setModalOpen(false), 0);
  }

  function handleAdd(result: S3UploadResult) {
    rememberUploadKey(result.Location, result.Key);
    rememberImageSizes(result.Location, columnsFromUploadResult(result));
    onChange([...values, result.Location]);
  }

  return (
    <div className={`md:col-span-2 ${className ?? ""}`}>
      <FormLabel label={label} required={required} />

      <button
        type="button"
        onClick={openModal}
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
          imageType={imageType}
          entityId={entityId}
          onClose={closeModal}
          onUploaded={(result) => {
            handleAdd(result);
            closeModal();
          }}
        />
      )}
    </div>
  );
}
