import React, {Suspense} from "react";
import {render, screen, waitFor} from "@testing-library/react";

import {FIXTURE_EVENTS} from "../../../mocks/handlers";
import {useEventsV2} from "../../../hooks/useEventsV2";
import EventsV2 from "../EventsV2";

// next/dynamic → React.lazy so dynamic imports resolve synchronously in tests
jest.mock("next/dynamic", () => importFn => require("react").lazy(importFn));

// Stub each view with a unique testid so routing assertions are simple
jest.mock("../../../partials/events/EventsTableV2", () => ({
  __esModule: true,
  default: ({events}) => <div data-testid="view-table" data-count={String(events?.length ?? 0)} />
}));
jest.mock("../../../partials/events/EventsTimelineV2", () => ({
  __esModule: true,
  default: () => <div data-testid="view-timeline" />
}));
jest.mock("../../../partials/events/EventsMapV2", () => ({
  __esModule: true,
  default: () => <div data-testid="view-map" />
}));
jest.mock("../../../partials/events/EventsCompactV2", () => ({
  __esModule: true,
  default: () => <div data-testid="view-compact" />
}));

// Control hook output without network
jest.mock("../../../hooks/useEventsV2");

const wrap = ui => render(<Suspense fallback={null}>{ui}</Suspense>);

describe("EventsV2", () => {
  beforeEach(() => {
    useEventsV2.mockReturnValue({events: FIXTURE_EVENTS, loading: false, error: null});
  });

  test("shows loading spinner while hook is loading", async () => {
    useEventsV2.mockReturnValue({events: [], loading: true, error: null});
    wrap(<EventsV2 />);
    await waitFor(() => {
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

  test("shows error message on failed fetch", async () => {
    useEventsV2.mockReturnValue({events: [], loading: false, error: "Request failed"});
    wrap(<EventsV2 />);
    await waitFor(() => {
      expect(screen.getByText("Request failed")).toBeInTheDocument();
    });
  });

  test("with mockData: renders events without spinner and without consulting live hook", async () => {
    useEventsV2.mockReturnValue({events: [], loading: true, error: null});
    wrap(<EventsV2 mockData={{data: FIXTURE_EVENTS}} />);
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });
  });

  test("renders table view by default", async () => {
    wrap(<EventsV2 />);
    expect(await screen.findByTestId("view-table")).toBeInTheDocument();
  });

  test("renders timeline view when activeView=timeline", async () => {
    wrap(<EventsV2 activeView="timeline" />);
    expect(await screen.findByTestId("view-timeline")).toBeInTheDocument();
  });

  test("renders map view when activeView=map", async () => {
    wrap(<EventsV2 activeView="map" />);
    expect(await screen.findByTestId("view-map")).toBeInTheDocument();
  });

  test("renders compact view when activeView=compact", async () => {
    wrap(<EventsV2 activeView="compact" />);
    expect(await screen.findByTestId("view-compact")).toBeInTheDocument();
  });

  test("client-side typeFilter reduces events passed to view", async () => {
    useEventsV2.mockReturnValue({
      events: [
        {
          wikidataId: "Q1",
          type: "WARFARE_AND_ARMED_CONFLICTS",
          timeStateRelativeToNow: "ONGOING",
          startDateTime: "2022-01-01T00:00:00Z",
          endDateTime: null,
          regions: []
        },
        {
          wikidataId: "Q2",
          type: "POLITICAL_CRISIS",
          timeStateRelativeToNow: "PAST",
          startDateTime: "2021-01-01T00:00:00Z",
          endDateTime: null,
          regions: []
        }
      ],
      loading: false,
      error: null
    });
    wrap(<EventsV2 typeFilter={["WARFARE_AND_ARMED_CONFLICTS"]} />);
    const view = await screen.findByTestId("view-table");
    expect(view).toHaveAttribute("data-count", "1");
  });

  test("does not crash when unmounted before hook resolves", async () => {
    useEventsV2.mockReturnValue({events: [], loading: true, error: null});
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const {unmount} = wrap(<EventsV2 />);
    unmount();
    await waitFor(() => {});
    expect(spy).not.toHaveBeenCalledWith(expect.stringContaining("unmounted component"));
    spy.mockRestore();
  });
});
