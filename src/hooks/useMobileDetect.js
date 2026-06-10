import {useSyncExternalStore} from "react";

export function useMobileDetect(breakpoint = 768) {
  return useSyncExternalStore(
    callback => {
      const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    () => window.matchMedia(`(max-width: ${breakpoint}px)`).matches,
    () => false
  );
}
