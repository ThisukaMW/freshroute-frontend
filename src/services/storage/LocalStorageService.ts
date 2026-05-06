
export const LocalStorageService = {
  get(key: string): any {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return raw; // return as-is if not valid JSON (e.g. plain string token)
      }
    } catch {
      return null;
    }
  },

  set(key: string, value: any): void {
    try {
      // Store strings directly, serialize everything else
      const toStore = typeof value === "string" ? value : JSON.stringify(value);
      window.localStorage.setItem(key, toStore);
    } catch {
      // noop
    }
  },

  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // noop
    }
  },
};
