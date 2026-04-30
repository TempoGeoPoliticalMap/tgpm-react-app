import {formatDateTime} from "../formatDateTime";

describe("formatDateTime", () => {
  test("formats ISO string with time as YYYY-MM-DD HH:MM", () => {
    expect(formatDateTime("2023-12-25T15:30:00Z")).toBe("2023-12-25 15:30");
  });

  test("strips time component when it is midnight", () => {
    expect(formatDateTime("2023-12-25T00:00:00Z")).toBe("2023-12-25");
  });

  test("returns null for null input", () => {
    expect(formatDateTime(null)).toBeNull();
  });

  test("returns null for undefined input", () => {
    expect(formatDateTime(undefined)).toBeNull();
  });

  test("returns null for empty string", () => {
    expect(formatDateTime("")).toBeNull();
  });

  test("returns original string for invalid date", () => {
    expect(formatDateTime("not-a-date")).toBe("not-a-date");
  });

  test("zero-pads single-digit month, day, hour", () => {
    expect(formatDateTime("2023-01-05T09:05:00Z")).toBe("2023-01-05 09:05");
  });
});
