export const PREVIEW_API_URL =
  "https://finance-api-preview.fededelavega2.workers.dev";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? PREVIEW_API_URL;

export const REQUEST_TIMEOUT_MS = 15000;
