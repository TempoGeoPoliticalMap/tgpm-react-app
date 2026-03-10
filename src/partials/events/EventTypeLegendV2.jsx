import React from "react";

import {
  AlertOutlined,
  ApartmentOutlined,
  BankOutlined,
  ClusterOutlined,
  FileProtectOutlined,
  FireOutlined,
  GlobalOutlined,
  MessageOutlined,
  SafetyOutlined,
  WarningOutlined
} from "@ant-design/icons";
import {Select} from "antd";

import {TYPES} from "../../constants/eventsV2Types";

export const TYPE_ICONS = {
  WARFARE_AND_ARMED_CONFLICTS: <FireOutlined />,
  POLITICAL_CRISIS: <WarningOutlined />,
  POLITICAL_MURDER: <AlertOutlined />,
  MILITARY_ALLIANCE: <SafetyOutlined />,
  MULTINATIONAL_MILITARY_COALITION: <ApartmentOutlined />,
  GEOPOLITICAL_GROUP: <GlobalOutlined />,
  INTERNATIONAL_ORGANISATION: <BankOutlined />,
  POLITICAL_CONFERENCE: <MessageOutlined />,
  SOURCE_OF_INTERNATIONAL_LAW: <FileProtectOutlined />,
  SUPRANATIONAL_UNION: <ClusterOutlined />
};

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
      style={{minWidth: 224}}
    />
  );
}

export default EventTypeLegendV2;
