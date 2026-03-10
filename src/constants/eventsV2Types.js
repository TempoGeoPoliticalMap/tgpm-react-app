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

export const TYPE_ICONS = {
  WARFARE_AND_ARMED_CONFLICTS: <FireOutlined style={{color: "#ef4444"}} />,
  POLITICAL_CRISIS: <WarningOutlined style={{color: "#ef4444"}} />,
  POLITICAL_MURDER: <AlertOutlined style={{color: "#ef4444"}} />,
  MILITARY_ALLIANCE: <SafetyOutlined style={{color: "#f97316"}} />,
  MULTINATIONAL_MILITARY_COALITION: <ApartmentOutlined style={{color: "#f97316"}} />,
  GEOPOLITICAL_GROUP: <GlobalOutlined style={{color: "#3b82f6"}} />,
  INTERNATIONAL_ORGANISATION: <BankOutlined style={{color: "#3b82f6"}} />,
  POLITICAL_CONFERENCE: <MessageOutlined style={{color: "#3b82f6"}} />,
  SOURCE_OF_INTERNATIONAL_LAW: <FileProtectOutlined style={{color: "#3b82f6"}} />,
  SUPRANATIONAL_UNION: <ClusterOutlined style={{color: "#3b82f6"}} />
};

export const TYPES = {
  GEOPOLITICAL_GROUP: {
    NAME: "Geopolitical Group",
    ICON: TYPE_ICONS.GEOPOLITICAL_GROUP
  },
  INTERNATIONAL_ORGANISATION: {
    NAME: "International Organisation",
    ICON: TYPE_ICONS.INTERNATIONAL_ORGANISATION
  },
  MILITARY_ALLIANCE: {
    NAME: "Military Alliance",
    ICON: TYPE_ICONS.MILITARY_ALLIANCE
  },
  MULTINATIONAL_MILITARY_COALITION: {
    NAME: "Multinational Military Coalition",
    ICON: TYPE_ICONS.MULTINATIONAL_MILITARY_COALITION
  },
  POLITICAL_CONFERENCE: {
    NAME: "Political Conference",
    ICON: TYPE_ICONS.POLITICAL_CONFERENCE
  },
  POLITICAL_CRISIS: {
    NAME: "Political Crisis",
    ICON: TYPE_ICONS.POLITICAL_CRISIS
  },
  POLITICAL_MURDER: {
    NAME: "Political Murder",
    ICON: TYPE_ICONS.POLITICAL_MURDER
  },
  SOURCE_OF_INTERNATIONAL_LAW: {
    NAME: "Source of International Law",
    ICON: TYPE_ICONS.SOURCE_OF_INTERNATIONAL_LAW
  },
  SUPRANATIONAL_UNION: {
    NAME: "Supranational Union",
    ICON: TYPE_ICONS.SUPRANATIONAL_UNION
  },
  WARFARE_AND_ARMED_CONFLICTS: {
    NAME: "Warfare and Armed Conflicts",
    ICON: TYPE_ICONS.WARFARE_AND_ARMED_CONFLICTS
  }
};

export const STATUSES = {
  PAST: "Past",
  ONGOING: "Now",
  FUTURE: "Future"
};

export const REGIONS = {
  EAST_ASIA_AND_PACIFIC: "East Asia & Pacific",
  EUROPE_AND_CENTRAL_ASIA: "Europe & Central Asia",
  LATIN_AMERICA_AND_CARIBBEAN: "Latin America & Caribbean",
  MIDDLE_EAST_AND_NORTH_AFRICA: "Middle East & North Africa",
  NORTH_AMERICA: "North America",
  SOUTH_ASIA: "South Asia",
  SUB_SAHARAN_AFRICA: "Sub-Saharan Africa"
};
