// Theme colors used by useColors() and useThemedStyles() to match the phone's theme.
export type Colors = {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  accent: string;
  onAccent: string;
  skeleton: string;
};

export const lightColors: Colors = {
  background: '#EEF3F8',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#4B5563',
  accent: '#2563EB',
  onAccent: '#FFFFFF',
  skeleton: '#D5DEE8',
};

export const darkColors: Colors = {
  background: '#0F172A',
  card: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  accent: '#60A5FA',
  onAccent: '#0F172A',
  skeleton: '#334155',
};
