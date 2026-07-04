import axios from "axios";
import { axiosInstance } from "./config";

export type S3UploadResult = {
  Location: string;
  Key: string;
  Bucket: string;
  ETag?: string;
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

function normalizeUploadPath(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
}

function getDeleteErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message ?? "Failed to delete file from AWS";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Failed to delete file from AWS";
}

function buildDeletePayload(url: string, path?: string, key?: string) {
  const trimmedUrl = url.trim();
  const payload: Record<string, string> = { url: trimmedUrl };

  if (key?.trim()) {
    payload.key = key.trim();
  }

  if (path) {
    payload.path = normalizeUploadPath(path);
  }

  return payload;
}

async function requestS3Delete(
  endpoint: string,
  url: string,
  path?: string,
  key?: string
): Promise<void> {
  const trimmedUrl = url?.trim();
  if (!trimmedUrl || trimmedUrl.startsWith("blob:")) {
    return;
  }

  const response = await axiosInstance.delete<DeleteUploadResponse>(endpoint, {
    data: buildDeletePayload(trimmedUrl, path, key),
  });

  if (!response.data?.success) {
    throw new Error(response.data?.message ?? "Failed to delete file from AWS");
  }
}

export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (percent: number) => void
): Promise<S3UploadResult> {
  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("path", normalizeUploadPath(path));

  const response = await axiosInstance.post<UploadApiResponse>("upload", formData, {
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
      if (!event.total || !onProgress) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });

  if (!response.data?.data?.Location) {
    throw new Error(response.data?.message ?? "Upload failed");
  }

  return response.data.data;
}

export async function deleteUploadedFile(
  url: string,
  path?: string,
  key?: string
): Promise<void> {
  try {
    await requestS3Delete("upload", url, path, key);
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
