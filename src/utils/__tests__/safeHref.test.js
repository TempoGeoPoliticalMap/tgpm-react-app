import {safeHref} from "../safeHref";

describe("safeHref", () => {
  test("passes through https URLs unchanged", () => {
    expect(safeHref("https://en.wikipedia.org/wiki/X")).toBe("https://en.wikipedia.org/wiki/X");
  });

  test("passes through http URLs unchanged", () => {
    expect(safeHref("http://example.com")).toBe("http://example.com");
  });

  test("rejects javascript: scheme", () => {
    expect(safeHref("javascript:alert(1)")).toBeNull();
  });

  test("rejects data: scheme", () => {
    expect(safeHref("data:text/html,<h1>x</h1>")).toBeNull();
  });

  test("returns null for empty string", () => {
    expect(safeHref("")).toBeNull();
  });

  test("returns null for null", () => {
    expect(safeHref(null)).toBeNull();
  });

  test("returns null for undefined", () => {
    expect(safeHref(undefined)).toBeNull();
  });

  test("returns null for malformed string", () => {
    expect(safeHref("not a url")).toBeNull();
  });
});
