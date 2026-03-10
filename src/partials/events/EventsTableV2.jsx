import React, {useEffect, useState} from "react";

import {axiosInstance} from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";

import EventsTableItemV2 from "./EventsTableItemV2";

function EventsTableV2({data, typeFilter, statusFilter, regionFilter, fromDate, toDate}) {
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
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
  }, [data]);

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
              {eventsList
                .filter(e => !typeFilter?.length || typeFilter.includes(e.type))
                .filter(e => !statusFilter?.length || statusFilter.includes(e.timeStateRelativeToNow))
                .filter(e => !fromDate || !e.endDateTime || fromDate.isBefore(e.endDateTime, "day"))
                .filter(e => !toDate || toDate.isAfter(e.startDateTime, "day"))
                .filter(e => !regionFilter?.length || e.regions?.some(r => regionFilter.includes(r)))
                .sort((a, b) => {
                  const startDiff = new Date(a.startDateTime) - new Date(b.startDateTime);
                  if (startDiff !== 0) return startDiff;
                  const aEnd = a.endDateTime ? new Date(a.endDateTime) : Infinity;
                  const bEnd = b.endDateTime ? new Date(b.endDateTime) : Infinity;
                  return aEnd - bEnd;
                })
                .map(event => (
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
