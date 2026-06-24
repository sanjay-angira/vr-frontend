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

function normalizeUploadPath(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
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
  path?: string
): Promise<boolean> {
  if (!url) return false;

  const response = await axiosInstance.delete<{ success: boolean }>("upload", {
    data: { url, path: path ? normalizeUploadPath(path) : undefined },
  });

  return Boolean(response.data?.success);
}

export async function deleteUploadedVideo(
  url: string,
  path?: string
): Promise<boolean> {
  if (!url) return false;

  const response = await axiosInstance.delete<{ success: boolean }>(
    "upload/video",
    {
      data: { url, path: path ? normalizeUploadPath(path) : undefined },
    }
  );

  return Boolean(response.data?.success);
}
