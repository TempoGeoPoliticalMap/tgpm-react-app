import React from "react";
import PropTypes from "prop-types";
import {Tooltip} from "antd";

import {REGION_COLORS, REGIONS, STATUSES, TYPES} from "../../constants/eventsV2Types";
import {formatDateTime} from "../../utils/formatDateTime";
import {TYPE_ICONS} from "../../constants/eventsV2Types";
import {safeHref} from "../../utils/safeHref";

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
          <Tooltip title={TYPES[props.type]?.NAME ?? props.type}>{TYPE_ICONS[props.type] ?? props.type}</Tooltip>
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-0.5 min-w-[400px]">
        <div className="font-bold">
          {safeHref(props.wikipediaUrl) ? (
            <a href={safeHref(props.wikipediaUrl)} target="_blank" rel="noreferrer" className="hover:underline">
              {props.name}
            </a>
          ) : (
            props.name
          )}
          {safeHref(props.wikidataUrl) && (
            <span className="ml-1 font-normal text-xs text-gray-400">
              (
              <a href={safeHref(props.wikidataUrl)} target="_blank" rel="noreferrer" className="hover:underline">
                {props.wikidataId}
              </a>
              )
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
        <div className="text-left">{props.countries?.map(c => c.name).join(", ")}</div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-0.5 whitespace-nowrap">
        <div className="text-left">{props.locations?.map(l => l.name).join(", ")}</div>
      </td>
    </tr>
  );
}

EventsTableItemV2.propTypes = {
  type: PropTypes.string,
  wikidataId: PropTypes.string,
  wikidataUrl: PropTypes.string,
  wikipediaUrl: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.string,
  status: PropTypes.string,
  startDateTime: PropTypes.string,
  endDateTime: PropTypes.string,
  regions: PropTypes.arrayOf(PropTypes.string),
  countries: PropTypes.arrayOf(PropTypes.shape({wikidataId: PropTypes.string, name: PropTypes.string})),
  locations: PropTypes.arrayOf(
    PropTypes.shape({wikidataId: PropTypes.string, name: PropTypes.string, coordinate: PropTypes.string})
  )
};

export default EventsTableItemV2;
