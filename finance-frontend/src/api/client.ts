import axios, { AxiosError, AxiosResponse } from "axios";

import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "../constants/config";
import type { ApiErrorResponse, ApiResponse } from "../types/models";

export interface HttpClientError extends Error {
  status?: number;
  details?: unknown;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.data?.error) {
      const normalizedError = new Error(
        error.response.data.error,
      ) as HttpClientError;
      normalizedError.status = error.response.status;
      normalizedError.details = error.response.data.details;
      return Promise.reject(normalizedError);
    }

    return Promise.reject(error);
  },
);

export function unwrapData<T>(response: AxiosResponse<ApiResponse<T>>): T {
  return response.data.data;
}
