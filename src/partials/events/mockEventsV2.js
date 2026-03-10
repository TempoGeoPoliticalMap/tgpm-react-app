export const mockEventsV2 = {
  data: [
    {
      wikidataId: "Q15860072",
      wikidataUrl: "https://www.wikidata.org/wiki/Q15860072",
      name: "Russo-Ukrainian War",
      type: "WARFARE_AND_ARMED_CONFLICTS",
      description:
        "Ongoing war between Russia and Ukraine, including the 2014 annexation of Crimea and the 2022 full-scale invasion.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Russo-Ukrainian_War",
      regions: ["EUROPE_AND_CENTRAL_ASIA"],
      countries: [
        {wikidataId: "Q212", name: "Ukraine"},
        {wikidataId: "Q159", name: "Russia"}
      ],
      locations: [
        {wikidataId: "Q15179", name: "Kyiv", coordinate: "50.4501,30.5234"},
        {wikidataId: "Q484697", name: "Kharkiv", coordinate: "49.9935,36.2304"}
      ],
      timeStateRelativeToNow: "ONGOING",
      startDateTime: "2014-02-20T00:00:00Z"
    },
    {
      wikidataId: "Q122962941",
      wikidataUrl: "https://www.wikidata.org/wiki/Q122962941",
      name: "Gaza War",
      type: "WARFARE_AND_ARMED_CONFLICTS",
      description:
        "Military conflict between Israel and Hamas-led Palestinian militant groups in the Gaza Strip, following the Hamas-led attack on Israel on 7 October 2023.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Gaza_war",
      regions: ["MIDDLE_EAST_AND_NORTH_AFRICA"],
      countries: [
        {wikidataId: "Q801", name: "Israel"},
        {wikidataId: "Q219060", name: "Palestine"}
      ],
      locations: [{wikidataId: "Q34763", name: "Gaza City", coordinate: "31.5017,34.4669"}],
      timeStateRelativeToNow: "ONGOING",
      startDateTime: "2023-10-07T00:00:00Z"
    },
    {
      wikidataId: "Q117716414",
      wikidataUrl: "https://www.wikidata.org/wiki/Q117716414",
      name: "Sudanese Civil War",
      type: "WARFARE_AND_ARMED_CONFLICTS",
      description: "Armed conflict between the Sudanese Armed Forces and the Rapid Support Forces paramilitary group.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Sudanese_civil_war_(2023%E2%80%93present)",
      regions: ["SUB_SAHARAN_AFRICA"],
      countries: [{wikidataId: "Q1049", name: "Sudan"}],
      locations: [{wikidataId: "Q1963", name: "Khartoum", coordinate: "15.5518,32.5324"}],
      timeStateRelativeToNow: "ONGOING",
      startDateTime: "2023-04-15T00:00:00Z"
    },
    {
      wikidataId: "Q110613097",
      wikidataUrl: "https://www.wikidata.org/wiki/Q110613097",
      name: "Myanmar Civil War",
      type: "WARFARE_AND_ARMED_CONFLICTS",
      description:
        "Armed conflict in Myanmar following the 2021 military coup, involving the military junta against pro-democracy resistance and ethnic armed organisations.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Myanmar_civil_war_(2021%E2%80%93present)",
      regions: ["EAST_ASIA_AND_PACIFIC"],
      countries: [{wikidataId: "Q836", name: "Myanmar"}],
      locations: [{wikidataId: "Q244773", name: "Naypyidaw", coordinate: "19.7450,96.1297"}],
      timeStateRelativeToNow: "ONGOING",
      startDateTime: "2021-02-01T00:00:00Z"
    },
    {
      wikidataId: "Q19686631",
      wikidataUrl: "https://www.wikidata.org/wiki/Q19686631",
      name: "Yemeni Civil War",
      type: "WARFARE_AND_ARMED_CONFLICTS",
      description:
        "Ongoing multi-sided civil war in Yemen, fought mainly between the Houthi movement and the internationally recognised government.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Yemeni_civil_war_(2014%E2%80%93present)",
      regions: ["MIDDLE_EAST_AND_NORTH_AFRICA"],
      countries: [{wikidataId: "Q805", name: "Yemen"}],
      locations: [{wikidataId: "Q82069", name: "Sanaa", coordinate: "15.3694,44.1910"}],
      timeStateRelativeToNow: "ONGOING",
      startDateTime: "2014-09-16T00:00:00Z"
    },
    {
      wikidataId: "Q217230",
      wikidataUrl: "https://www.wikidata.org/wiki/Q217230",
      name: "War in Afghanistan",
      type: "WARFARE_AND_ARMED_CONFLICTS",
      description:
        "War in Afghanistan from 2001 to 2021, initiated by the United States-led coalition following the September 11 attacks.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/War_in_Afghanistan_(2001%E2%80%932021)",
      regions: ["SOUTH_ASIA"],
      countries: [
        {wikidataId: "Q889", name: "Afghanistan"},
        {wikidataId: "Q30", name: "United States"}
      ],
      locations: [{wikidataId: "Q5838", name: "Kabul", coordinate: "34.5253,69.1783"}],
      timeStateRelativeToNow: "PAST",
      startDateTime: "2001-10-07T00:00:00Z",
      endDateTime: "2021-08-30T00:00:00Z"
    },
    {
      wikidataId: "Q11192",
      wikidataUrl: "https://www.wikidata.org/wiki/Q11192",
      name: "Iraq War",
      type: "WARFARE_AND_ARMED_CONFLICTS",
      description:
        "War in Iraq from 2003 to 2011, initiated by a United States-led coalition that overthrew the Ba'athist government of Saddam Hussein.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Iraq_War",
      regions: ["MIDDLE_EAST_AND_NORTH_AFRICA"],
      countries: [
        {wikidataId: "Q796", name: "Iraq"},
        {wikidataId: "Q30", name: "United States"}
      ],
      locations: [{wikidataId: "Q1530", name: "Baghdad", coordinate: "33.3406,44.4009"}],
      timeStateRelativeToNow: "PAST",
      startDateTime: "2003-03-20T00:00:00Z",
      endDateTime: "2011-12-18T00:00:00Z"
    }
  ],
  pagination: {
    page: 1,
    pageSize: 100,
    totalItems: 7,
    totalPages: 1,
    hasNextPage: false
  }
};
