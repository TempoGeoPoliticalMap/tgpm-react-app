// parseCoordinate lives inside EventsMapV2; extracted here for unit testing.
// Keep in sync if the function moves to its own module.
function parseCoordinate(coordinate) {
  const parts = coordinate.split(",");

  if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) return null;
  const [lat, lng] = parts.map(Number);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return [lat, lng];
}

describe("parseCoordinate", () => {
  test("parses valid coordinate string", () => {
    expect(parseCoordinate("51.5,-0.1")).toEqual([51.5, -0.1]);
  });

  test("accepts boundary values", () => {
    expect(parseCoordinate("-90,180")).toEqual([-90, 180]);
  });

  test("rejects lat > 90", () => {
    expect(parseCoordinate("91,0")).toBeNull();
  });

  test("rejects lng > 180", () => {
    expect(parseCoordinate("0,181")).toBeNull();
  });

  test("rejects non-numeric segments", () => {
    expect(parseCoordinate("abc,def")).toBeNull();
  });

  test("rejects empty string", () => {
    expect(parseCoordinate("")).toBeNull();
  });

  test("rejects lone comma", () => {
    expect(parseCoordinate(",")).toBeNull();
  });
});
