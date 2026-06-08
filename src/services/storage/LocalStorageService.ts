// LocalStorageService.ts
// A simple helper for saving, reading, and deleting things in the browser's localStorage.
// Handles errors quietly so the app never crashes because of a storage problem.

export const LocalStorageService = {

  // Reads a value from localStorage by its key name.
  // Tries to parse it as JSON; if that fails, returns it as a plain string.
  // Returns null if the key doesn't exist or something goes wrong.
  get(key: string): any {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return null;
      try {
        return JSON.parse(raw); // Try to turn it back into an object/array.
      } catch {
        return raw; // It's just a plain string (like a token), return it as-is.
      }
    } catch {
      return null; // localStorage itself failed (e.g. in a private browser).
    }
  },

  // Saves a value to localStorage under the given key.
  // Strings are stored directly; objects/arrays are turned into JSON first.
  set(key: string, value: any): void {
    try {
      const toStore = typeof value === "string" ? value : JSON.stringify(value);
      window.localStorage.setItem(key, toStore);
    } catch {
      // If saving fails, do nothing — the app keeps working without the saved value.
    }
  },

  // Deletes a value from localStorage by its key name.
  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // If deleting fails, do nothing.
    }
  },
};