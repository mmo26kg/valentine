import { format } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

// Vietnam Timezone
const VN_TIMEZONE = "Asia/Ho_Chi_Minh";

/**
 * Returns the current Date object representing the time in Vietnam (GMT+7).
 * This ensures consistency regardless of the user's local device time.
 */
export function getVietnamDate(date?: Date | string | number): Date {
    const d = date ? new Date(date) : new Date();
    return toZonedTime(d, VN_TIMEZONE);
}

/**
 * Parses a date string assuming it is in Vietnam time (GMT+7) and returns a Date object (UTC).
 * Useful for setting target dates like "2026-02-14" which should mean midnight in VN.
 */
export function parseVietnamDate(dateStr: string): Date {
    return fromZonedTime(dateStr, VN_TIMEZONE);
}

/**
 * Formats a date string according to Vietnam time.
 * @param date - Date to format (defaults to now in VN time if omitted)
 * @param formatStr - Format string (e.g. "yyyy-MM-dd")
 */
export function formatVietnamDate(date: Date | string | number | undefined, formatStr: string): string {
    const vnDate = getVietnamDate(date);
    return format(vnDate, formatStr);
}

/**
 * Calculates the number of days between the start date and today (in VN time).
 * @param startDateStr - Start date string (YYYY-MM-DD)
 */
export function getDaysTogether(startDateStr: string): number {
    // Robust approach:
    // 1. Get current VN date string (YYYY-MM-DD) -> "today"
    // 2. Parse startDateStr as local date (midnight)
    // 3. Parse current VN date string as local date (midnight)
    // 4. Compare timestamps.
    // This avoids timezone shifting issues on day boundaries.

    const todayStr = formatVietnamDate(undefined, "yyyy-MM-dd");
    const todayDate = new Date(todayStr); // Local midnight of string
    const startDate = new Date(startDateStr); // Local midnight of string

    // We treat both as local dates to just count calendar days.
    // startDateStr is "2024-02-14". todayStr is "2026-02-14" (example).
    // result should be clean.

    const diffTime = Math.abs(todayDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}
