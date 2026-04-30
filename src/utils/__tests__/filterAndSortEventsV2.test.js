import {filterAndSortEventsV2} from "../filterAndSortEventsV2";

const makeEvent = (overrides = {}) => ({
  wikidataId: "Q1",
  type: "WARFARE_AND_ARMED_CONFLICTS",
  timeStateRelativeToNow: "ONGOING",
  startDateTime: "2022-01-01T00:00:00Z",
  endDateTime: "2023-01-01T00:00:00Z",
  regions: ["EUROPE_AND_CENTRAL_ASIA"],
  ...overrides
});

const noFilter = {typeFilter: [], statusFilter: [], regionFilter: [], fromDate: null, toDate: null};

describe("filterAndSortEventsV2", () => {
  test("empty typeFilter passes all events through", () => {
    const events = [makeEvent(), makeEvent({wikidataId: "Q2", type: "POLITICAL_CRISIS"})];
    expect(filterAndSortEventsV2(events, noFilter)).toHaveLength(2);
  });

  test("typeFilter keeps only matching events", () => {
    const events = [
      makeEvent({wikidataId: "Q1", type: "WARFARE_AND_ARMED_CONFLICTS"}),
      makeEvent({wikidataId: "Q2", type: "POLITICAL_CRISIS"})
    ];
    const result = filterAndSortEventsV2(events, {...noFilter, typeFilter: ["WARFARE_AND_ARMED_CONFLICTS"]});
    expect(result).toHaveLength(1);
    expect(result[0].wikidataId).toBe("Q1");
  });

  test("typeFilter with unknown value returns empty list", () => {
    const events = [makeEvent()];
    expect(filterAndSortEventsV2(events, {...noFilter, typeFilter: ["NONEXISTENT"]})).toHaveLength(0);
  });

  test("regionFilter keeps only events with matching region", () => {
    const events = [
      makeEvent({wikidataId: "Q1", regions: ["EUROPE_AND_CENTRAL_ASIA"]}),
      makeEvent({wikidataId: "Q2", regions: ["NORTH_AMERICA"]})
    ];
    const result = filterAndSortEventsV2(events, {...noFilter, regionFilter: ["EUROPE_AND_CENTRAL_ASIA"]});
    expect(result).toHaveLength(1);
    expect(result[0].wikidataId).toBe("Q1");
  });

  test("fromDate excludes events that end before it", () => {
    const events = [makeEvent({endDateTime: "2020-01-01T00:00:00Z"})];
    const fromDate = {isBefore: dt => new Date("2021-01-01") < new Date(dt)};
    expect(filterAndSortEventsV2(events, {...noFilter, fromDate})).toHaveLength(0);
  });

  test("toDate excludes events that start after it", () => {
    const events = [makeEvent({startDateTime: "2025-01-01T00:00:00Z"})];
    const toDate = {isAfter: dt => new Date("2024-01-01") > new Date(dt)};
    expect(filterAndSortEventsV2(events, {...noFilter, toDate})).toHaveLength(0);
  });

  test("null fromDate and toDate apply no date constraint", () => {
    const events = [makeEvent(), makeEvent({wikidataId: "Q2"})];
    expect(filterAndSortEventsV2(events, noFilter)).toHaveLength(2);
  });

  test("events without endDateTime pass fromDate filter", () => {
    const events = [makeEvent({endDateTime: null})];
    const fromDate = {isBefore: () => true};
    expect(filterAndSortEventsV2(events, {...noFilter, fromDate})).toHaveLength(1);
  });

  test("events without regions do not crash region filter", () => {
    const events = [makeEvent({regions: undefined})];
    expect(filterAndSortEventsV2(events, {...noFilter, regionFilter: ["NORTH_AMERICA"]})).toHaveLength(0);
  });

  test("output is sorted by startDateTime ascending", () => {
    const events = [
      makeEvent({wikidataId: "Q2", startDateTime: "2023-01-01T00:00:00Z"}),
      makeEvent({wikidataId: "Q1", startDateTime: "2020-01-01T00:00:00Z"})
    ];
    const result = filterAndSortEventsV2(events, noFilter);
    expect(result[0].wikidataId).toBe("Q1");
  });

  test("events with equal startDateTime sorted by endDateTime", () => {
    const events = [
      makeEvent({wikidataId: "Q2", startDateTime: "2020-01-01T00:00:00Z", endDateTime: "2022-01-01T00:00:00Z"}),
      makeEvent({wikidataId: "Q1", startDateTime: "2020-01-01T00:00:00Z", endDateTime: "2021-01-01T00:00:00Z"})
    ];
    const result = filterAndSortEventsV2(events, noFilter);
    expect(result[0].wikidataId).toBe("Q1");
  });

  test("input array is not mutated", () => {
    const events = [
      makeEvent({wikidataId: "Q2", startDateTime: "2023-01-01T00:00:00Z"}),
      makeEvent({wikidataId: "Q1", startDateTime: "2020-01-01T00:00:00Z"})
    ];
    const original = [...events];
    filterAndSortEventsV2(events, noFilter);
    expect(events[0].wikidataId).toBe(original[0].wikidataId);
  });
});
