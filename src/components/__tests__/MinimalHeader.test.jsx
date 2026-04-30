import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";

import MinimalHeader from "../MinimalHeader";

const VIEWS = [
  {id: "table", label: "Table"},
  {id: "timeline", label: "Timeline"}
];

const defaultProps = {
  filtersNode: <span data-testid="filter-slot">filters</span>,
  activeView: "table",
  onViewChange: jest.fn(),
  views: VIEWS,
  collapsed: false,
  onCollapse: jest.fn()
};

describe("MinimalHeader", () => {
  test("renders filtersNode inside header", () => {
    render(<MinimalHeader {...defaultProps} />);
    expect(screen.getByTestId("filter-slot")).toBeInTheDocument();
  });

  test("view dropdown opens on button click", () => {
    render(<MinimalHeader {...defaultProps} />);
    fireEvent.click(screen.getByText(/View: Table/i));
    expect(screen.getByText("View: Timeline")).toBeInTheDocument();
  });

  test("clicking a view option calls onViewChange with correct id", () => {
    const onViewChange = jest.fn();
    render(<MinimalHeader {...defaultProps} onViewChange={onViewChange} />);
    fireEvent.click(screen.getByText(/View: Table/i));
    fireEvent.click(screen.getByText("View: Timeline"));
    expect(onViewChange).toHaveBeenCalledWith("timeline");
  });

  test("collapse button calls onCollapse", () => {
    const onCollapse = jest.fn();
    render(<MinimalHeader {...defaultProps} onCollapse={onCollapse} />);
    fireEvent.click(screen.getByLabelText("Collapse header"));
    expect(onCollapse).toHaveBeenCalledTimes(1);
  });

  test("active view label shown in button text", () => {
    render(<MinimalHeader {...defaultProps} activeView="timeline" />);
    expect(screen.getByText(/View: Timeline/i)).toBeInTheDocument();
  });
});
