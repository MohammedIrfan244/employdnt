/**
 * Date and time utilities designed to respect the client's local time.
 * Always handles date strings and formatting from the user's perspective.
 */

/**
 * Returns a date formatted as YYYY-MM-DD in the user's local timezone.
 */
export function getClientDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Adds a specific number of days to a given date and returns a new Date object.
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Formats a date into a localized readable string (e.g. "Oct 30, 2026").
 */
export function formatClientDate(
  dateInput: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  }
): string {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" || typeof dateInput === "number" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, options).format(date);
}

/**
 * Formats a date into a localized time string (e.g. "9:05 PM").
 */
export function formatClientTime(
  dateInput: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  }
): string {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" || typeof dateInput === "number" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, options).format(date);
}

/**
 * Checks if a given date corresponds to today in the user's local time.
 */
export function isClientDateToday(dateInput: Date | string): boolean {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return getClientDateString(date) === getClientDateString(new Date());
}

/**
 * Calculates how many days until or since a target date relative to the client's today.
 * Positive = future, Negative = past, 0 = today.
 */
export function getRelativeDayDifference(targetDate: Date | string): number {
  const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
  const today = new Date();

  // Reset time portions to compare calendar days accurately in local time
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  const diffMs = targetMidnight - todayMidnight;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

