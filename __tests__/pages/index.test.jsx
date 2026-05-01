/* eslint-disable react/prop-types */
import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";

import Home from "../../pages/index";

// Capture props passed to EventsV2 as data attributes for easy assertion
jest.mock("../../src/components/events/EventsV2", () => ({
  __esModule: true,
  default: jest.fn(({activeView, typeFilter, fromDate, toDate}) => (
    <div
      data-testid="events-v2"
      data-active-view={activeView}
      data-type-filter={JSON.stringify(typeFilter ?? [])}
      data-has-from={fromDate != null ? "true" : "false"}
      data-has-to={toDate != null ? "true" : "false"}
    />
  ))
}));

// Expose MinimalHeader internals via simple buttons
jest.mock("../../src/components/MinimalHeader", () => ({
  __esModule: true,
  default: jest.fn(({onViewChange, onCollapse, views, collapsed, filtersNode}) => (
    <div data-testid="header" data-collapsed={String(collapsed)}>
      <div data-testid="filters">{filtersNode}</div>
      {views.map(v => (
        <button key={v.id} data-testid={`view-btn-${v.id}`} onClick={() => onViewChange(v.id)}>
          {v.label}
        </button>
      ))}
      <button data-testid="collapse-btn" onClick={onCollapse}>
        Collapse
      </button>
    </div>
  ))
}));

// Simple type-filter button that fires a selection
jest.mock("../../src/partials/events/EventTypeLegendV2", () => ({
  __esModule: true,
  default: ({onChange}) => (
    <button data-testid="type-filter-btn" onClick={() => onChange(["WARFARE_AND_ARMED_CONFLICTS"])}>
      Select type
    </button>
  )
}));

// Simple date inputs — onChange receives a plain object (truthy) or null
jest.mock("antd", () => ({
  DatePicker: ({onChange, placeholder}) => (
    <input
      data-testid={`date-${placeholder}`}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value ? {value: e.target.value} : null)}
    />
  )
}));

jest.mock("../../src/components/ErrorBoundary", () => ({
  ErrorBoundary: ({children}) => <>{children}</>
}));

jest.mock("next/head", () => ({
  __esModule: true,
  default: ({children}) => <>{children}</>
}));

describe("Home (pages/index.js)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("default render passes activeView=table to EventsV2", () => {
    render(<Home />);
    expect(screen.getByTestId("events-v2")).toHaveAttribute("data-active-view", "table");
  });

  test("clicking a view button updates activeView passed to EventsV2", () => {
    render(<Home />);
    fireEvent.click(screen.getByTestId("view-btn-timeline"));
    expect(screen.getByTestId("events-v2")).toHaveAttribute("data-active-view", "timeline");
  });

  test("selecting an event type passes it into typeFilter", () => {
    render(<Home />);
    fireEvent.click(screen.getByTestId("type-filter-btn"));
    expect(screen.getByTestId("events-v2")).toHaveAttribute(
      "data-type-filter",
      JSON.stringify(["WARFARE_AND_ARMED_CONFLICTS"])
    );
  });

  test("setting a from date passes non-null fromDate to EventsV2", () => {
    render(<Home />);
    fireEvent.change(screen.getByTestId("date-From date"), {target: {value: "2024-01-01"}});
    expect(screen.getByTestId("events-v2")).toHaveAttribute("data-has-from", "true");
  });

  test("setting a to date passes non-null toDate to EventsV2", () => {
    render(<Home />);
    fireEvent.change(screen.getByTestId("date-To date"), {target: {value: "2024-12-31"}});
    expect(screen.getByTestId("events-v2")).toHaveAttribute("data-has-to", "true");
  });

  test("collapse button toggles header and writes to localStorage", () => {
    render(<Home />);
    expect(screen.getByTestId("header")).toHaveAttribute("data-collapsed", "false");
    fireEvent.click(screen.getByTestId("collapse-btn"));
    expect(screen.getByTestId("header")).toHaveAttribute("data-collapsed", "true");
    expect(localStorage.getItem("tgpm-header-collapsed")).toBe("true");
  });

  test("reads collapsed=true from localStorage on mount", async () => {
    localStorage.setItem("tgpm-header-collapsed", "true");
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByTestId("header")).toHaveAttribute("data-collapsed", "true");
    });
  });

  test("does not crash when localStorage throws on read", () => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error("SecurityError");
    };
    expect(() => render(<Home />)).not.toThrow();
    Storage.prototype.getItem = original;
  });
});
