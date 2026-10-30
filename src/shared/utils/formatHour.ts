// '2026-10-28T14:00' -> '14:00'. the string is already in the location's time,
// so we only cut it. never go through Date: that would use the phone's timezone
export function formatHour(localTime: string): string {
  return localTime.slice(11, 16);
}
