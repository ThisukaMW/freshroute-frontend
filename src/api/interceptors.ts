// interceptors.ts
// Adds auth token injection and 401 handling to the API client.

import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { LocalStorageService } from "../services/storage/LocalStorageService";

export const setupInterceptors = (client: AxiosInstance): void => {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = LocalStorageService.get("fr_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        console.error("API error:", error.response || error.message);

        if (status === 401) {
          LocalStorageService.remove("fr_token");
          LocalStorageService.remove("fr_user");
          LocalStorageService.remove("fr_buyer_profile");
          LocalStorageService.remove("fr_seller_profile");
          window.location.href = "/signin";
        }
      } else if (error instanceof Error) {
        console.error("Unexpected error:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }

      return Promise.reject(error);
    },
  );
};
