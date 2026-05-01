import {http, HttpResponse} from "msw";

export const FIXTURE_EVENTS = [
  {
    wikidataId: "Q1",
    type: "WARFARE_AND_ARMED_CONFLICTS",
    name: "Test Conflict",
    description: "A test conflict",
    timeStateRelativeToNow: "ONGOING",
    startDateTime: "2022-01-01T00:00:00Z",
    endDateTime: null,
    regions: ["EUROPE_AND_CENTRAL_ASIA"],
    countries: [{wikidataId: "Q212", name: "Ukraine"}],
    locations: [{wikidataId: "Q123", name: "Kyiv", coordinate: "50.45,30.52"}],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Test",
    wikidataUrl: "https://www.wikidata.org/wiki/Q1"
  }
];

export const handlers = [http.get("https://api.tgpm.world/v2/events", () => HttpResponse.json({data: FIXTURE_EVENTS}))];

export const networkErrorHandler = http.get("https://api.tgpm.world/v2/events", () => HttpResponse.error());
