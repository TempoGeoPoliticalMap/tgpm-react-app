import React from "react";

import {Select} from "antd";

import {REGIONS} from "../../constants/eventsV2Types";

const REGION_COLORS = {
  EAST_ASIA_AND_PACIFIC:        "bg-red-100 text-red-700",
  EUROPE_AND_CENTRAL_ASIA:      "bg-blue-100 text-blue-700",
  LATIN_AMERICA_AND_CARIBBEAN:  "bg-green-100 text-green-700",
  MIDDLE_EAST_AND_NORTH_AFRICA: "bg-amber-100 text-amber-700",
  NORTH_AMERICA:                "bg-indigo-100 text-indigo-700",
  SOUTH_ASIA:                   "bg-orange-100 text-orange-700",
  SUB_SAHARAN_AFRICA:           "bg-yellow-100 text-yellow-800"
};

const OPTIONS = Object.keys(REGIONS).map(key => ({
  value: key,
  label: (
    <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${REGION_COLORS[key] ?? "bg-slate-100 text-slate-500"}`}>
      {REGIONS[key]}
    </span>
  )
}));

function EventRegionFilterV2({selectedRegions, onChange}) {
  return (
    <Select
      mode="multiple"
      allowClear
      placeholder="Filter by region…"
      value={selectedRegions}
      onChange={onChange}
      options={OPTIONS}
      style={{minWidth: 220}}
    />
  );
}

export default EventRegionFilterV2;
