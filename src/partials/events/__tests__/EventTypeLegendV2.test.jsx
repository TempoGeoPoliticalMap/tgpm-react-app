import React from "react";
import {render, screen} from "@testing-library/react";

import EventTypeLegendV2 from "../EventTypeLegendV2";

describe("EventTypeLegendV2", () => {
  test("renders without crashing with empty selectedTypes", () => {
    const onChange = jest.fn();
    render(<EventTypeLegendV2 selectedTypes={[]} onChange={onChange} />);
    expect(screen.getByText(/Filter by event type/i)).toBeInTheDocument();
  });
});
