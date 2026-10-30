import { en, type MessageKey } from './en';

type Params = Record<string, string | number>;

// swaps {name} for params.name. a missing param leaves the placeholder as is
export function t(key: MessageKey, params: Params = {}): string {
  return en[key].replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    String(params[name] ?? placeholder),
  );
}

export type Translate = typeof t;

// components call useT() instead of importing t, so a language setting can be
// added later by changing only this hook
export function useT() {
  return t;
}
