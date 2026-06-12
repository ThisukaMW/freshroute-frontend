// client.ts
// Creates the Axios HTTP client used by the auth API layer.
// This mirrors the shared store/api client so older imports keep working.

import axios from "axios";
import { setupInterceptors } from "./interceptors";

// Creates a reusable Axios instance.
// baseURL = backend URL + API version prefix from the environment.
// Content-Type = the app sends JSON requests by default.
const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach auth token handling and 401 cleanup.
setupInterceptors(client);

export default client;
