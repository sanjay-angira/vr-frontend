import axios from "axios";
import { axiosInstance } from "./config";
import type {
  ImageOptimizationType,
  OptimizedImageColumns,
} from "@/utils/optimizedImage";
import { columnsFromUploadResult } from "@/utils/optimizedImage";
import { rememberImageSizes } from "@/utils/imageSizesCache";

export type S3UploadResult = OptimizedImageColumns & {
  Location: string;
  Key: string;
  Bucket: string;
  ETag?: string;
  original?: string;
  width?: number;
  height?: number;
  assetId?: string;
};

type UploadApiResponse = {
  success: boolean;
  data: S3UploadResult;
  message?: string;
};

type DeleteUploadResponse = {
  success: boolean;
  message?: string;
};

export type UploadOptions = {
  path?: string;
  imageType?: ImageOptimizationType;
  entityId?: string | number;
  onProgress?: (percent: number) => void;
};

function normalizeUploadPath(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;
    const raw = data?.message;
    if (Array.isArray(raw)) {
      return raw.filter(Boolean).join(", ") || fallback;
    }
    if (typeof raw === "string" && raw.trim()) {
      return raw;
    }
    return error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

function getDeleteErrorMessage(error: unknown): string {
  return getApiErrorMessage(error, "Failed to delete file from AWS");
}

function buildDeletePayload(
  url: string,
  path?: string,
  key?: string,
  variants?: OptimizedImageColumns | null
) {
  const trimmedUrl = url.trim();
  const payload: Record<string, unknown> = { url: trimmedUrl };

  if (key?.trim()) {
    payload.key = key.trim();
  }

  if (path) {
    payload.path = normalizeUploadPath(path);
  }

  if (variants) {
    payload.variants = variants;
  }

  return payload;
}

async function requestS3Delete(
  endpoint: string,
  url: string,
  path?: string,
  key?: string,
  variants?: OptimizedImageColumns | null
): Promise<void> {
  const trimmedUrl = url?.trim();
  if (!trimmedUrl || trimmedUrl.startsWith("blob:")) {
    return;
  }

  const response = await axiosInstance.delete<DeleteUploadResponse>(endpoint, {
    data: buildDeletePayload(trimmedUrl, path, key, variants),
  });

  if (!response.data?.success) {
    throw new Error(response.data?.message ?? "Failed to delete file from AWS");
  }
}

export async function uploadFile(
  file: File,
  pathOrOptions: string | UploadOptions,
  onProgress?: (percent: number) => void
): Promise<S3UploadResult> {
  const options: UploadOptions =
    typeof pathOrOptions === "string"
      ? { path: pathOrOptions, onProgress }
      : { ...pathOrOptions, onProgress: pathOrOptions.onProgress ?? onProgress };

  const formData = new FormData();
  formData.append("file", file, file.name);

  if (options.path) {
    formData.append("path", normalizeUploadPath(options.path));
  }
  if (options.imageType) {
    formData.append("imageType", options.imageType);
  }
  if (options.entityId != null && String(options.entityId).trim()) {
    formData.append("entityId", String(options.entityId));
  }

  let response;
  try {
    response = await axiosInstance.post<UploadApiResponse>("upload", formData, {
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      transformRequest: [
        (data, headers) => {
          if (headers && typeof headers === "object") {
            delete (headers as Record<string, unknown>)["Content-Type"];
          }
          return data;
        },
      ],
      onUploadProgress: (event) => {
        if (!event.total || !options.onProgress) return;
        options.onProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Upload failed"));
  }

  if (!response.data?.data?.Location) {
    throw new Error(response.data?.message ?? "Upload failed");
  }

  const result = response.data.data;
  const columns = columnsFromUploadResult(result);
  rememberImageSizes(result.Location, columns);
  if (result.original) {
    rememberImageSizes(result.original, columns);
  }

  return { ...result, ...columns };
}

export async function deleteUploadedFile(
  url: string,
  path?: string,
  key?: string,
  variants?: OptimizedImageColumns | null
): Promise<void> {
  try {
    await requestS3Delete("upload", url, path, key, variants);
  } catch (error) {
    throw new Error(getDeleteErrorMessage(error));
  }
}

export async function deleteUploadedVideo(
  url: string,
  path?: string,
  key?: string
): Promise<void> {
  try {
    await requestS3Delete("upload/video", url, path, key);
  } catch (error) {
    throw new Error(getDeleteErrorMessage(error));
  }
}

export { getDeleteErrorMessage };
