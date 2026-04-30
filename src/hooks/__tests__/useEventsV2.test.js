import {renderHook, act, waitFor} from "@testing-library/react";

import {server} from "../../mocks/server";
import {networkErrorHandler} from "../../mocks/handlers";
import {useEventsV2} from "../useEventsV2";

describe("useEventsV2", () => {
  test("starts in loading state with empty events", () => {
    const {result} = renderHook(() => useEventsV2());
    expect(result.current.loading).toBe(true);
    expect(result.current.events).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  test("populates events after successful fetch", async () => {
    const {result} = renderHook(() => useEventsV2());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.events.length).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });

  test("sets error string on network failure", async () => {
    server.use(networkErrorHandler);
    const {result} = renderHook(() => useEventsV2());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
    expect(result.current.events).toEqual([]);
  });

  test("does not update state after unmount", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const {unmount} = renderHook(() => useEventsV2());
    unmount();
    // Wait a tick to let any pending promises settle
    await act(async () => {});
    expect(spy).not.toHaveBeenCalledWith(expect.stringContaining("Can't perform a React state update"));
    spy.mockRestore();
  });
});
