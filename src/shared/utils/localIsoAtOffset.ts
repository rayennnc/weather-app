// epoch ms -> the clock of a place as 'YYYY-MM-DDTHH:mm'. it has the same shape
// as the time strings of the api, so the two can be compared as plain text.
// built from UTC parts of a shifted date, so the phone's timezone never leaks in
export function localIsoAtOffset(
  epochMs: number,
  utcOffsetSeconds: number,
): string {
  return new Date(epochMs + utcOffsetSeconds * 1000).toISOString().slice(0, 16);
}
