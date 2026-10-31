// round to 1 decimal and remove trailing .0
export function formatPrecipitation(millimetres: number): string {
  return `${Number(millimetres.toFixed(1))} mm`;
}
