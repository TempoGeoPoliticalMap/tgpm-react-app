import React from "react";
import {render, screen} from "@testing-library/react";

import EventMobileCardV2 from "../EventMobileCardV2";

const base = {
  type: "WARFARE_AND_ARMED_CONFLICTS",
  name: "Test Conflict",
  description: "A test conflict description",
  timeStateRelativeToNow: "ONGOING",
  startDateTime: "2022-01-01T00:00:00Z",
  endDateTime: null,
  wikipediaUrl: "https://en.wikipedia.org/wiki/Test",
  wikidataUrl: "https://www.wikidata.org/wiki/Q1",
  imageUrl: null
};

describe("EventMobileCardV2", () => {
  test("renders event name", () => {
    render(<EventMobileCardV2 {...base} />);
    expect(screen.getByText("Test Conflict")).toBeInTheDocument();
  });

  test("title is a link to wikipediaUrl when valid", () => {
    render(<EventMobileCardV2 {...base} />);
    const link = screen.getByRole("link", {name: "Test Conflict"});
    expect(link).toHaveAttribute("href", "https://en.wikipedia.org/wiki/Test");
  });

  test("falls back to wikidataUrl when wikipediaUrl is null", () => {
    render(<EventMobileCardV2 {...base} wikipediaUrl={null} />);
    const link = screen.getByRole("link", {name: "Test Conflict"});
    expect(link).toHaveAttribute("href", "https://www.wikidata.org/wiki/Q1");
  });

  test("renders plain span when both URLs are null", () => {
    render(<EventMobileCardV2 {...base} wikipediaUrl={null} wikidataUrl={null} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Test Conflict")).toBeInTheDocument();
  });

  test("renders plain span when URLs use a non-http scheme", () => {
    render(<EventMobileCardV2 {...base} wikipediaUrl="javascript:alert(1)" wikidataUrl="data:text/html,x" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  test("renders description when provided", () => {
    render(<EventMobileCardV2 {...base} />);
    expect(screen.getByText("A test conflict description")).toBeInTheDocument();
  });

  test("renders no description element when description is absent", () => {
    render(<EventMobileCardV2 {...base} description={null} />);
    expect(screen.queryByText("A test conflict description")).not.toBeInTheDocument();
  });

  test("renders img when imageUrl is a valid https URL", () => {
    render(<EventMobileCardV2 {...base} imageUrl="https://example.com/img.png" />);
    const img = screen.getByRole("img", {name: "Test Conflict"});
    expect(img.tagName).toBe("IMG");
    expect(img).toHaveAttribute("src", "https://example.com/img.png");
  });

  test("upgrades http imageUrl to https to avoid mixed-content blocking", () => {
    render(<EventMobileCardV2 {...base} imageUrl="http://commons.wikimedia.org/wiki/Special:FilePath/example.png" />);
    const img = screen.getByRole("img", {name: "Test Conflict"});
    expect(img.getAttribute("src")).toMatch(/^https:/);
  });

  test("appends ?width=144 to Wikimedia Special:FilePath URLs for thumbnail", () => {
    render(<EventMobileCardV2 {...base} imageUrl="https://commons.wikimedia.org/wiki/Special:FilePath/example.png" />);
    const img = screen.getByRole("img", {name: "Test Conflict"});
    expect(img.getAttribute("src")).toContain("width=144");
  });

  test("does not append width param to non-Wikimedia image URLs", () => {
    render(<EventMobileCardV2 {...base} imageUrl="https://example.com/img.png" />);
    const img = screen.getByRole("img", {name: "Test Conflict"});
    expect(img.getAttribute("src")).toBe("https://example.com/img.png");
  });

  test("renders type-icon fallback when imageUrl is null", () => {
    render(<EventMobileCardV2 {...base} imageUrl={null} />);
    expect(screen.queryByRole("img", {name: "Test Conflict"})).not.toBeInTheDocument();
    expect(screen.getByRole("img", {name: /Warfare/i})).toBeInTheDocument();
  });

  test("renders type-icon fallback when imageUrl uses a non-http scheme", () => {
    render(<EventMobileCardV2 {...base} imageUrl="javascript:alert(1)" />);
    expect(screen.getByRole("img", {name: /Warfare/i})).toBeInTheDocument();
  });

  test("shows 'ongoing' label for ONGOING status with no endDate", () => {
    render(<EventMobileCardV2 {...base} timeStateRelativeToNow="ONGOING" endDateTime={null} />);
    expect(screen.getByText(/ongoing/i)).toBeInTheDocument();
  });

  test("shows formatted end date for PAST status", () => {
    render(<EventMobileCardV2 {...base} timeStateRelativeToNow="PAST" endDateTime="2023-06-01T00:00:00Z" />);
    expect(screen.getByText(/2023-06-01/)).toBeInTheDocument();
  });

  test("external links carry rel=noreferrer", () => {
    render(<EventMobileCardV2 {...base} />);
    const link = screen.getByRole("link", {name: "Test Conflict"});
    expect(link).toHaveAttribute("rel", "noreferrer");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
