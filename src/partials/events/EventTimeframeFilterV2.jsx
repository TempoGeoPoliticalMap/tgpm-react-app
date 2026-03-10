import React from "react";

import {DatePicker} from "antd";

function EventTimeframeFilterV2({fromDate, toDate, onFromChange, onToChange}) {
  return (
    <div className="flex items-center gap-2">
      <DatePicker
        placeholder="From date"
        value={fromDate}
        onChange={onFromChange}
        disabledDate={current => toDate && current && current.isAfter(toDate, "day")}
      />
      <span className="text-slate-400">—</span>
      <DatePicker
        placeholder="To date"
        value={toDate}
        onChange={onToChange}
        disabledDate={current => fromDate && current && current.isBefore(fromDate, "day")}
      />
    </div>
  );
}

export default EventTimeframeFilterV2;
