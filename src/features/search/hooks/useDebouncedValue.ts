import { useEffect, useState } from 'react';

// follows `value`, but only after it stayed the same for `delayMs`
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    // a new value (or an unmount) cancels the wait
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
