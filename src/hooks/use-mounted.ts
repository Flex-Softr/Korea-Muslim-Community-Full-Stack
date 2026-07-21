import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Hook to determine if the component has mounted on the client.
 * Uses `useSyncExternalStore` to avoid cascading renders caused by `setState` inside `useEffect`.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
