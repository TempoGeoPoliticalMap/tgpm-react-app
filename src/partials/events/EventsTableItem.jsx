import React from "react";

import {STATUSES, TYPES} from "../../constants/events";

function EventsTableItem(props) {
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

  // const amountColor = amount => {
  //   switch (amount.charAt(0)) {
  //     case "+":
  //       return "text-emerald-500";
  //     default:
  //       return "text-slate-700";
  //   }
  // };

  return (
    <tr>
      <td className="px-2 first:pl-5 last:pr-5 py-0.5 whitespace-nowrap">
        <div className="text-left">{TYPES[props.type].NAME}</div>
        {/*<div className="text-left">{TYPES.WARFARE_AND_ARMED_CONFLICTS.NAME}</div>*/}
      </td>
      {/*<td className="px-2 first:pl-5 last:pr-5 py-0.5 whitespace-nowrap">*/}
      {/*    <div className="text-left">{props.id}</div>*/}
      {/*</td>*/}
      <td className="px-2 first:pl-5 last:pr-5 py-0.5 whitespace-nowrap">
        <div className="text-left">{props.name}</div>
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
        <div className="text-left">{props.startDateTime}</div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-0.5 whitespace-nowrap">
        <div className="text-left">{props.endDateTime}</div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-0.5 whitespace-nowrap">
        {/*<div className="text-left">{props.territories.join(", ")}</div>*/}
        <div className="text-left">TBD</div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-0.5 whitespace-nowrap">
        {/*<div className="text-left">{props.locations.map(value => value.name).join(", ")}</div>*/}
        <div className="text-left">TBD</div>
      </td>
    </tr>
  );
}

export default EventsTableItem;
