"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * SSR'da `false`, client hydration'dan keyin `true` qaytaradi.
 * `useEffect + setState` pattern'iga muqobil — eslint-friendly.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
