import React from "react";
import {Select} from "antd";

import {TYPE_ICONS, TYPES} from "../../constants/eventsV2Types";

const OPTIONS = Object.keys(TYPE_ICONS).map(key => ({
  value: key,
  label: (
    <span className="flex items-center gap-2">
      {TYPE_ICONS[key]}
      {TYPES[key].NAME}
    </span>
  )
}));

function EventTypeLegendV2({selectedTypes, onChange}) {
  return (
    <Select
      mode="multiple"
      allowClear
      placeholder={<span style={{color: "#000"}}>Filter by event type…</span>}
      value={selectedTypes}
      onChange={onChange}
      options={OPTIONS}
      virtual={false}
      listHeight={1000}
      getPopupContainer={trigger => trigger.parentElement}
      dropdownStyle={{zIndex: 2300, maxHeight: "none", overflow: "visible"}}
      style={{minWidth: 269}}
    />
  );
}

export default EventTypeLegendV2;
