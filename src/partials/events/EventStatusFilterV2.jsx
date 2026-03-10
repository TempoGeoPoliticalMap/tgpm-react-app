import React from "react";
import {Select} from "antd";

import {STATUSES} from "../../constants/eventsV2Types";

const STATUS_COLORS = {
  PAST: "bg-green-300 text-gray-500",
  ONGOING: "bg-yellow-100 text-black",
  FUTURE: "bg-gray-100 text-gray-600"
};

const OPTIONS = Object.keys(STATUSES).map(key => ({
  value: key,
  label: <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${STATUS_COLORS[key]}`}>{STATUSES[key]}</span>
}));

function EventStatusFilterV2({selectedStatuses, onChange}) {
  return (
    <Select
      mode="multiple"
      allowClear
      placeholder="Filter by status…"
      value={selectedStatuses}
      onChange={onChange}
      options={OPTIONS}
      style={{minWidth: 220}}
    />
  );
}

export default EventStatusFilterV2;
