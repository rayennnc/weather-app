export type WindSpeedUnit = 'kmh' | 'mph';

const LABELS: Record<WindSpeedUnit, string> = {
  kmh: 'km/h',
  mph: 'mph',
};

// round to the nearest whole number
export function formatWindSpeed(value: number, unit: WindSpeedUnit): string {
  return `${Math.round(value)} ${LABELS[unit]}`;
}
