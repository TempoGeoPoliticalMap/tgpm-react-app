import React from "react";
import {render, screen} from "@testing-library/react";

import EventsMobileV2 from "../EventsMobileV2";

const EVENTS = [
  {
    wikidataId: "Q1",
    type: "WARFARE_AND_ARMED_CONFLICTS",
    name: "First Conflict",
    description: "desc one",
    timeStateRelativeToNow: "ONGOING",
    startDateTime: "2022-01-01T00:00:00Z",
    endDateTime: null,
    wikipediaUrl: "https://en.wikipedia.org/wiki/First",
    wikidataUrl: "https://www.wikidata.org/wiki/Q1",
    imageUrl: null
  },
  {
    wikidataId: "Q2",
    type: "POLITICAL_CRISIS",
    name: "Second Crisis",
    description: "desc two",
    timeStateRelativeToNow: "PAST",
    startDateTime: "2020-01-01T00:00:00Z",
    endDateTime: "2021-01-01T00:00:00Z",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Second",
    wikidataUrl: "https://www.wikidata.org/wiki/Q2",
    imageUrl: null
  }
];

describe("EventsMobileV2", () => {
  test("renders one card per event", () => {
    render(<EventsMobileV2 events={EVENTS} />);
    expect(screen.getByText("First Conflict")).toBeInTheDocument();
    expect(screen.getByText("Second Crisis")).toBeInTheDocument();
  });

  test("renders empty-state message when events is empty", () => {
    render(<EventsMobileV2 events={[]} />);
    expect(screen.getByText(/No events found/i)).toBeInTheDocument();
  });

  test("renders empty-state when events prop is omitted", () => {
    render(<EventsMobileV2 />);
    expect(screen.getByText(/No events found/i)).toBeInTheDocument();
  });
});
