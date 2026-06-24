import axios, { type AxiosRequestConfig } from "axios";
import { axiosInstance } from "./config";
import { ApiErrorResponse } from "./errors";

type QueryParams = Record<string, string | number | boolean | undefined>;

type RequestOptions = {
  auth?: boolean;
  signal?: AbortSignal;
};

function parseError(error: unknown): ApiErrorResponse {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    const message = data?.message ?? error.message ?? "Request failed";
    return { success: false, message, statusCode: error.response?.status };
  }

  if (error instanceof Error) {
    return { success: false, message: error.message };
  }

  return { success: false, message: "Request failed" };
}

function buildConfig(options?: RequestOptions): AxiosRequestConfig & { skipAuth?: boolean } {
  const config: AxiosRequestConfig & { skipAuth?: boolean } =
    options?.auth === false ? { skipAuth: true } : {};

  if (options?.signal) {
    config.signal = options.signal;
  }

  return config;
}

function isAbortError(error: unknown): boolean {
  return (
    axios.isCancel(error) ||
    (axios.isAxiosError(error) && error.code === "ERR_CANCELED")
  );
}

export async function getData(
  url: string,
  params?: QueryParams,
  options?: RequestOptions
) {
  try {
    const res = await axiosInstance.get(url, {
      params,
      ...buildConfig(options),
    });
    return res.data;
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    return Promise.reject(parseError(error));
  }
}

export async function postData(
  url: string,
  data?: unknown,
  options?: RequestOptions
) {
  try {
    const res = await axiosInstance.post(url, data, buildConfig(options));
    return res.data;
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    return Promise.reject(parseError(error));
  }
}

export async function putData(
  url: string,
  data?: unknown,
  options?: RequestOptions
) {
  try {
    const res = await axiosInstance.put(url, data, buildConfig(options));
    return res.data;
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    return Promise.reject(parseError(error));
  }
}

export async function patchData(
  url: string,
  data?: unknown,
  options?: RequestOptions
) {
  try {
    const res = await axiosInstance.patch(url, data, buildConfig(options));
    return res.data;
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    return Promise.reject(parseError(error));
  }
}

export async function deleteData(url: string, options?: RequestOptions) {
  try {
    const res = await axiosInstance.delete(url, buildConfig(options));
    return res.data;
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    return Promise.reject(parseError(error));
  }
}
