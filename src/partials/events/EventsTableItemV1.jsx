import React from "react";

import {STATUSES, TYPES} from "../../constants/eventsV1Types";
import {formatDateTime} from "../../utils/formatDateTime";

function EventsTableItemV1(props) {
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
        <div className="text-left">{TYPES[props.type].NAME}</div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-0.5 whitespace-nowrap">
        <div className="text-left font-bold">{props.name}</div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-0.5 whitespace-nowrap">
        <div className="text-center">
          <div
            className={`text-xs inline-flex font-medium rounded-full text-center px-2.5 py-0.5 ${statusColor(
              props.status
            )}`}>
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
      <td className="px-2 first:pl-5 last:pr-5 py-0.5 whitespace-nowrap">
        <div className="text-left">{props.countries}</div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-0.5 whitespace-nowrap">
        <div className="text-left">{props.locations}</div>
      </td>
    </tr>
  );
}

export default EventsTableItemV1;
