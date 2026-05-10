// interceptors.ts
// Adds two automatic behaviours to every HTTP request/response:
// 1. Injects the auth token into outgoing requests.
// 2. Catches 401 errors and logs the user out automatically.

import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { LocalStorageService } from '../../services/storage/LocalStorageService';

// Takes the Axios client and attaches request + response interceptors to it.
export const setupInterceptors = (client: AxiosInstance): void => {

  // REQUEST interceptor — runs before every outgoing API call.
  // Reads the saved token and adds it to the Authorization header automatically.
  // This means no page has to manually add the token to every request.
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = LocalStorageService.get('fr_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Send the request with the updated headers.
  });

  // RESPONSE interceptor — runs after every response comes back from the server.
  client.interceptors.response.use(
    // If the request succeeded, just pass the response through unchanged.
    (response: AxiosResponse) => response,

    // If the request failed, handle the error here.
    (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        console.error('API error:', error.response || error.message);

        // 401 = "not authorized" — the token is expired or invalid.
        // Clear all saved login data and send the user back to the sign-in page.
        if (status === 401) {
          LocalStorageService.remove('fr_token');
          LocalStorageService.remove('fr_user');
          LocalStorageService.remove('fr_buyer_profile');
          LocalStorageService.remove('fr_seller_profile');
          window.location.href = '/signin';
        }

      } else if (error instanceof Error) {
        // A normal JavaScript error (not an HTTP error).
        console.error('Unexpected error:', error.message);
      } else {
        // Something completely unknown went wrong.
        console.error('Unexpected error:', error);
      }

      // Pass the error along so the calling code can also handle it if needed.
      return Promise.reject(error);
    }
  );
};