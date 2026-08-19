// client.ts
// Creates the Axios HTTP client used by the auth API layer.
// This mirrors the shared store/api client so older imports keep working.

import axios from "axios";
import { setupInterceptors } from "./interceptors";

// Creates a reusable Axios instance.
// baseURL = backend URL + API version prefix from the environment.
// No default Content-Type — axios picks the right one per request on its
// own. Hardcoding application/json here breaks file uploads sent as
// FormData through this client (see src/store/api/client.ts for the same
// fix and the full explanation).
const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
});

// Attach auth token handling and 401 cleanup.
setupInterceptors(client);

export default client;
