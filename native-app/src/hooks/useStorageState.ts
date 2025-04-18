import * as SecureStore from 'expo-secure-store';
import { useReducer, useEffect, useCallback } from 'react';

type UseStateHook = [[boolean, string | null], (value: string | null) => void];

function useAsyncState(
  initialValue: [boolean, string | null] = [true, null],
): UseStateHook {
  return useReducer(
    (state: [boolean, string | null], action: string | null = null): [boolean, string | null] => [
      false,
      action,
    ],
    initialValue,
  ) as UseStateHook;
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (value == null) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export function useStorageState(key: string): UseStateHook {
  // Public
  const [state, setState] = useAsyncState();

  // Get
  useEffect(() => {
    SecureStore.getItemAsync(key).then(value => {
      setState(value);
    });
  }, [key, setState]);

  // Set
  const setValue = useCallback(
    (value: string | null) => {
      setState(value);
      setStorageItemAsync(key, value);
    },
    [key, setState],
  );

  return [state, setValue];
}
