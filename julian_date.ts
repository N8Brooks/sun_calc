/** One 24-hour day in ms */
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

/** Julian days of the beginning of year 1970 */
const JULIAN_DAYS_1970 = 2_440_588;

/** Julian days of the beginning of year 2000 */
const JULIAN_DAYS_2000 = 2_451_545;

/** Julian days of a date */
export function toJulian(date: Date): number {
  return date.getTime() / ONE_DAY_IN_MS - 0.5 + JULIAN_DAYS_1970;
}

/** `Date` `Object` from Julian days */
export function fromJulian(julianDays: number): Date {
  const daysSince1970 = julianDays + 0.5 - JULIAN_DAYS_1970;
  const msSince1970 = ONE_DAY_IN_MS * daysSince1970;
  return new Date(msSince1970);
}

/** Julian days since the beginning of year 2000 */
export function toDays(date: Date): number {
  return toJulian(date) - JULIAN_DAYS_2000;
}
