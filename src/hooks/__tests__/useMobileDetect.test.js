import {renderHook, act} from "@testing-library/react";

import {useMobileDetect} from "../useMobileDetect";

function makeMq(initialMatches) {
  let matches = initialMatches;
  const listeners = [];

  return {
    get matches() {
      return matches;
    },
    addEventListener: jest.fn((_, fn) => listeners.push(fn)),
    removeEventListener: jest.fn((_, fn) => {
      const i = listeners.indexOf(fn);

      if (i !== -1) listeners.splice(i, 1);
    }),
    // Update matches then notify — useSyncExternalStore re-calls getSnapshot after notification
    _emit: newMatches => {
      matches = newMatches;
      listeners.forEach(fn => fn());
    }
  };
}

describe("useMobileDetect", () => {
  let mq;

  beforeEach(() => {
    mq = makeMq(false);
    window.matchMedia = jest.fn(() => mq);
  });

  test("returns false when matchMedia does not match", () => {
    const {result} = renderHook(() => useMobileDetect());
    expect(result.current).toBe(false);
  });

  test("returns true when matchMedia matches on mount", () => {
    mq = makeMq(true);
    window.matchMedia = jest.fn(() => mq);
    const {result} = renderHook(() => useMobileDetect());
    expect(result.current).toBe(true);
  });

  test("updates state when the media query changes", () => {
    const {result} = renderHook(() => useMobileDetect());
    expect(result.current).toBe(false);

    act(() => mq._emit(true));
    expect(result.current).toBe(true);

    act(() => mq._emit(false));
    expect(result.current).toBe(false);
  });

  test("removes event listener on unmount", () => {
    const {unmount} = renderHook(() => useMobileDetect());
    unmount();
    expect(mq.removeEventListener).toHaveBeenCalledTimes(1);
  });

  test("uses custom breakpoint in the media query string", () => {
    renderHook(() => useMobileDetect(1024));
    expect(window.matchMedia).toHaveBeenCalledWith("(max-width: 1024px)");
  });
});
