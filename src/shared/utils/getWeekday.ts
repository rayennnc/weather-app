const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export type Weekday = (typeof WEEKDAYS)[number];

// '2026-10-28' -> 'wed'. built from UTC parts, so the phone's timezone never
// moves the date to the day before or after
export function getWeekday(date: string): Weekday {
  const [year, month, day] = date.split('-').map(Number);
  return WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}
