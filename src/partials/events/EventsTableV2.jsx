import React from "react";
import PropTypes from "prop-types";

import EventsTableItemV2 from "./EventsTableItemV2";

function EventsTableV2({events = []}) {
  return (
    <div className="bg-white">
      <div>
        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            <thead className="text-xs font-semibold uppercase text-slate-500 border-t border-b border-slate-200">
              <tr>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-center">Type</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Name</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-center">Status</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Start Date/Time</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">End Date/Time</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Regions</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Countries</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Locations</div>
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-200 border-b border-slate-200">
              {events.map(event => (
                <EventsTableItemV2
                  key={event.wikidataId}
                  type={event.type}
                  wikidataId={event.wikidataId}
                  wikidataUrl={event.wikidataUrl}
                  wikipediaUrl={event.wikipediaUrl}
                  name={event.name}
                  description={event.description}
                  status={event.timeStateRelativeToNow}
                  startDateTime={event.startDateTime}
                  endDateTime={event.endDateTime}
                  regions={event.regions}
                  countries={event.countries}
                  locations={event.locations}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

EventsTableV2.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object)
};

export default EventsTableV2;
