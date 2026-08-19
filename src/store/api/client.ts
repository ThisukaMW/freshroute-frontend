// client.ts
// Creates the Axios HTTP client that the whole app uses to talk to the backend.
// Every API call goes through this single client so interceptors apply everywhere.

import axios from 'axios';
import { setupInterceptors } from './interceptors';

// Creates a reusable Axios instance.
// baseURL = your backend's address + the API version prefix (read from .env).
// No default Content-Type here — axios sets the right one per request on its
// own (application/json for plain objects, multipart/form-data with the
// correct boundary for FormData). Hardcoding application/json here broke
// every file upload (e.g. product images), since axios won't override an
// explicitly-set header even when the body is FormData.
const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
});

// Attaches the auth token injector and 401 error handler to this client.
setupInterceptors(client);

export default client;