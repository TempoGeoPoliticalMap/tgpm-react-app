import React from "react";

import {Tooltip} from "antd";

import {REGIONS, STATUSES, TYPES} from "../../constants/eventsV2Types";
import {formatDateTime} from "../../utils/formatDateTime";
import {TYPE_ICONS} from "./EventTypeLegendV2";

const REGION_COLORS = {
  EAST_ASIA_AND_PACIFIC:        "bg-red-100 text-red-700",
  EUROPE_AND_CENTRAL_ASIA:      "bg-blue-100 text-blue-700",
  LATIN_AMERICA_AND_CARIBBEAN:  "bg-green-100 text-green-700",
  MIDDLE_EAST_AND_NORTH_AFRICA: "bg-amber-100 text-amber-700",
  NORTH_AMERICA:                "bg-indigo-100 text-indigo-700",
  SOUTH_ASIA:                   "bg-orange-100 text-orange-700",
  SUB_SAHARAN_AFRICA:           "bg-yellow-100 text-yellow-800"
};

function EventsTableItemV2(props) {
  const statusColor = status => {
    switch (status) {
      case "PAST":
        return "bg-green-300 text-gray-500";
      case "ONGOING":
        return "bg-yellow-100 text-black";
      case "FUTURE":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-slate-100 text-slate-500";
    }
  };

  return (
    <tr className="text-black">
      <td className="px-2 first:pl-5 last:pr-5 py-0.5 whitespace-nowrap">
        <div className="text-center text-lg">
          <Tooltip title={TYPES[props.type]?.NAME ?? props.type}>
            {TYPE_ICONS[props.type] ?? props.type}
          </Tooltip>
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-0.5">
        <div className="font-bold">
          {props.wikipediaUrl
            ? <a href={props.wikipediaUrl} target="_blank" rel="noreferrer" className="hover:underline">{props.name}</a>
            : props.name}
          {props.wikidataUrl && (
            <span className="ml-1 font-normal text-xs text-gray-400">
              (<a href={props.wikidataUrl} target="_blank" rel="noreferrer" className="hover:underline">{props.wikidataId}</a>)
            </span>
          )}
        </div>
        {props.description && (
          <div className="text-xs text-gray-500 mt-0.5 max-w-md whitespace-normal">{props.description}</div>
        )}
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-0.5 whitespace-nowrap">
        <div className="text-center">
          <div
            className={`text-xs inline-flex font-medium rounded-full text-center px-2.5 py-0.5 ${statusColor(props.status)}`}>
            {STATUSES[props.status]}
          </div>
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-0.5 whitespace-nowrap">
        <div className="text-left">{formatDateTime(props.startDateTime)}</div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-0.5 whitespace-nowrap">
        <div className="text-left">{formatDateTime(props.endDateTime)}</div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-0.5">
        <div className="flex flex-wrap gap-1">
          {props.regions?.map(r => (
            <span
              key={r}
              className={`text-xs font-medium rounded-full px-2.5 py-0.5 whitespace-nowrap ${REGION_COLORS[r] ?? "bg-slate-100 text-slate-500"}`}>
              {REGIONS[r] ?? r}
            </span>
          ))}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-0.5 whitespace-nowrap">
        <div className="text-left">
          {props.countries?.map(c => c.name).join(", ")}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-0.5 whitespace-nowrap">
        <div className="text-left">
          {props.locations?.map(l => l.name).join(", ")}
        </div>
      </td>
    </tr>
  );
}

export default EventsTableItemV2;
