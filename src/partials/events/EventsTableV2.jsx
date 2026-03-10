import React, {useEffect, useMemo, useState} from "react";

import {axiosInstance} from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import {filterAndSortEventsV2} from "../../utils/filterAndSortEventsV2";

import EventsTableItemV2 from "./EventsTableItemV2";

function EventsTableV2({data, typeFilter, statusFilter, regionFilter, fromDate, toDate, events}) {
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (events) {
      setError(null);
      setLoading(false);
      return;
    }

    if (data) {
      setEventsList(data.data);
      setError(null);
      setTimeout(() => setLoading(false), 500);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const fetchEvents = async () => {
      try {
        let response = await axiosInstance.get("v2/events");

        if (!cancelled) setEventsList(response.data.data);
      } catch (err) {
        if (!cancelled) setError("Failed to load events. Please try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, [data, events]);

  const filteredEvents = useMemo(() => {
    if (events) return events;
    return filterAndSortEventsV2(eventsList, {typeFilter, statusFilter, regionFilter, fromDate, toDate});
  }, [events, eventsList, typeFilter, statusFilter, regionFilter, fromDate, toDate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-5 text-red-500">{error}</div>;

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
              {filteredEvents.map(event => (
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

export default EventsTableV2;
