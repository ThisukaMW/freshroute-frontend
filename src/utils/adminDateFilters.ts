/** Default start date = 7 days ago (YYYY-MM-DD, local). */
export const defaultSinceDate = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return toDateInputValue(d);
};

export const todayDateInput = (): string => toDateInputValue(new Date());

const toDateInputValue = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const startOfDay = (dateStr: string): Date => {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const endOfDay = (dateStr: string): Date => {
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const isDateInRange = (
  isoDate: string,
  since: string,
  until: string,
): boolean => {
  const t = new Date(isoDate).getTime();
  return t >= startOfDay(since).getTime() && t <= endOfDay(until).getTime();
};

export const formatDisplayDate = (d: string) =>
  new Date(d).toLocaleDateString("en-LK", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
