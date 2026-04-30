import {renderHook, act, waitFor} from "@testing-library/react";
import {http, HttpResponse} from "msw";

import {server} from "../../mocks/server";
import {networkErrorHandler, FIXTURE_EVENTS} from "../../mocks/handlers";
import {useEventsV2} from "../useEventsV2";

describe("useEventsV2", () => {
  test("starts in loading state with empty events", async () => {
    const {result} = renderHook(() => useEventsV2());
    expect(result.current.loading).toBe(true);
    expect(result.current.events).toEqual([]);
    expect(result.current.error).toBeNull();
    await act(async () => {});
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
    await act(async () => {
      unmount();
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(spy).not.toHaveBeenCalledWith(expect.stringContaining("Can't perform a React state update"));
    spy.mockRestore();
  });

  test("sends types as repeated query params", async () => {
    let capturedUrl;
    server.use(
      http.get("https://api.tgpm.world/v2/events", ({request}) => {
        capturedUrl = request.url;
        return HttpResponse.json({data: FIXTURE_EVENTS});
      })
    );
    const {result} = renderHook(() => useEventsV2({types: ["WARFARE_AND_ARMED_CONFLICTS", "POLITICAL_CRISIS"]}));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const params = new URL(capturedUrl).searchParams;
    expect(params.getAll("types")).toContain("WARFARE_AND_ARMED_CONFLICTS");
    expect(params.getAll("types")).toContain("POLITICAL_CRISIS");
  });

  test("sends timeslot_start and timeslot_end as query params", async () => {
    let capturedUrl;
    server.use(
      http.get("https://api.tgpm.world/v2/events", ({request}) => {
        capturedUrl = request.url;
        return HttpResponse.json({data: FIXTURE_EVENTS});
      })
    );
    const {result} = renderHook(() =>
      useEventsV2({timeslotStart: "2022-01-01T00:00:00.000Z", timeslotEnd: "2023-01-01T23:59:59.999Z"})
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    const params = new URL(capturedUrl).searchParams;
    expect(params.get("timeslot_start")).toBe("2022-01-01T00:00:00.000Z");
    expect(params.get("timeslot_end")).toBe("2023-01-01T23:59:59.999Z");
  });

  test("omits filter params when not provided", async () => {
    let capturedUrl;
    server.use(
      http.get("https://api.tgpm.world/v2/events", ({request}) => {
        capturedUrl = request.url;
        return HttpResponse.json({data: FIXTURE_EVENTS});
      })
    );
    const {result} = renderHook(() => useEventsV2());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const params = new URL(capturedUrl).searchParams;
    expect(params.has("types")).toBe(false);
    expect(params.has("timeslot_start")).toBe(false);
    expect(params.has("timeslot_end")).toBe(false);
  });

  test("re-fetches when types change", async () => {
    let fetchCount = 0;
    server.use(
      http.get("https://api.tgpm.world/v2/events", () => {
        fetchCount++;
        return HttpResponse.json({data: FIXTURE_EVENTS});
      })
    );
    const {result, rerender} = renderHook(({types}) => useEventsV2({types}), {initialProps: {types: []}});
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchCount).toBe(1);

    rerender({types: ["WARFARE_AND_ARMED_CONFLICTS"]});
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchCount).toBe(2);
  });

  test("does not re-fetch when types array changes reference but content is the same", async () => {
    let fetchCount = 0;
    server.use(
      http.get("https://api.tgpm.world/v2/events", () => {
        fetchCount++;
        return HttpResponse.json({data: FIXTURE_EVENTS});
      })
    );
    const {result, rerender} = renderHook(({types}) => useEventsV2({types}), {
      initialProps: {types: ["WARFARE_AND_ARMED_CONFLICTS"]}
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchCount).toBe(1);

    rerender({types: ["WARFARE_AND_ARMED_CONFLICTS"]});
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchCount).toBe(1);
  });

  test("deduplicates events with the same wikidataId", async () => {
    const duplicates = [FIXTURE_EVENTS[0], {...FIXTURE_EVENTS[0], name: "Duplicate"}];
    server.use(http.get("https://api.tgpm.world/v2/events", () => HttpResponse.json({data: duplicates})));
    const {result} = renderHook(() => useEventsV2());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].wikidataId).toBe("Q1");
  });
});
