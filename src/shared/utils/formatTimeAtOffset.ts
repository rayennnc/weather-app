function twoDigits(value: number): string {
  return String(value).padStart(2, '0');
}

// format epoch milliseconds as HH:mm at the given UTC offset
export function formatTimeAtOffset(
  epochMs: number,
  utcOffsetSeconds: number,
): string {
  const shifted = new Date(epochMs + utcOffsetSeconds * 1000);
  return `${twoDigits(shifted.getUTCHours())}:${twoDigits(
    shifted.getUTCMinutes(),
  )}`;
}
