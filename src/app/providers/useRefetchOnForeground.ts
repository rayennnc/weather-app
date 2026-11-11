import { focusManager } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState } from 'react-native';

// TanStack refetches stale queries on focus.
// on mobile, AppState signals when the app becomes active.
export function useRefetchOnForeground() {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', status => {
      focusManager.setFocused(status === 'active');
    });
    return () => subscription.remove();
  }, []);
}
