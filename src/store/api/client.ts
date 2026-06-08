// client.ts
// Creates the Axios HTTP client that the whole app uses to talk to the backend.
// Every API call goes through this single client so interceptors apply everywhere.

import axios from 'axios';
import { setupInterceptors } from './interceptors';

// Creates a reusable Axios instance.
// baseURL = your backend's address + the API version prefix (read from .env).
// Content-Type header = tells the server we're always sending JSON.
const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attaches the auth token injector and 401 error handler to this client.
setupInterceptors(client);

export default client;