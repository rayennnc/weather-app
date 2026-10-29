// 30.6 -> '31°'. whether it is °C or °F depends on the unit we asked the api for
export function formatTemperature(value: number): string {
  return `${Math.round(value)}°`;
}
