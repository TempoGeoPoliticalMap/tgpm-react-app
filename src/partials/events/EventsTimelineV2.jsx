import React, {useEffect, useMemo, useState} from "react";

import {Tooltip} from "antd";

import {axiosInstance} from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import {TYPES} from "../../constants/eventsV2Types";
import {formatDateTime} from "../../utils/formatDateTime";
import {TYPE_ICONS} from "./EventTypeLegendV2";

const TODAY = new Date();

const TYPE_COL_WIDTH = 56;
const NAME_COL_WIDTH = 300;

const STATUS_BAR_COLORS = {
  PAST:    "bg-green-400",
  ONGOING: "bg-yellow-400",
  FUTURE:  "bg-slate-400"
};

function EventsTimelineV2({data, typeFilter, statusFilter, regionFilter, fromDate, toDate}) {
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
        const response = await axiosInstance.get("v2/events");
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

  const filtered = useMemo(() => {
    return eventsList
      .filter(e => !typeFilter?.length || typeFilter.includes(e.type))
      .filter(e => !statusFilter?.length || statusFilter.includes(e.timeStateRelativeToNow))
      .filter(e => !regionFilter?.length || e.regions?.some(r => regionFilter.includes(r)))
      .filter(e => !fromDate || !e.endDateTime || fromDate.isBefore(e.endDateTime, "day"))
      .filter(e => !toDate || toDate.isAfter(e.startDateTime, "day"))
      .sort((a, b) => {
        const startDiff = new Date(a.startDateTime) - new Date(b.startDateTime);
        if (startDiff !== 0) return startDiff;
        const aEnd = a.endDateTime ? new Date(a.endDateTime) : Infinity;
        const bEnd = b.endDateTime ? new Date(b.endDateTime) : Infinity;
        return aEnd - bEnd;
      });
  }, [eventsList, typeFilter, statusFilter, regionFilter, fromDate, toDate]);

  const {minDate, maxDate, totalMs} = useMemo(() => {
    if (!filtered.length) {
      const min = new Date(TODAY);
      min.setFullYear(min.getFullYear() - 1);
      const max = new Date(TODAY);
      max.setFullYear(max.getFullYear() + 1);
      return {minDate: min, maxDate: max, totalMs: max - min};
    }
    const starts = filtered.map(e => new Date(e.startDateTime).getTime());
    const ends = filtered.map(e => (e.endDateTime ? new Date(e.endDateTime) : TODAY).getTime());
    const min = new Date(Math.min(...starts));
    const max = new Date(Math.max(...ends, TODAY.getTime()));
    min.setMonth(min.getMonth() - 3);
    max.setMonth(max.getMonth() + 3);
    return {minDate: min, maxDate: max, totalMs: max.getTime() - min.getTime()};
  }, [filtered]);

  const yearMarkers = useMemo(() => {
    const markers = [];
    for (let y = minDate.getFullYear(); y <= maxDate.getFullYear(); y++) {
      const left = (new Date(y, 0, 1).getTime() - minDate.getTime()) / totalMs * 100;
      if (left >= 0 && left <= 100) markers.push({year: y, left});
    }
    return markers;
  }, [minDate, maxDate, totalMs]);

  const todayLeft = (TODAY.getTime() - minDate.getTime()) / totalMs * 100;

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-5 text-red-500">{error}</div>;

  return (
    <div className="bg-white overflow-x-auto">
      {/* Header */}
      <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
        <div style={{width: TYPE_COL_WIDTH, minWidth: TYPE_COL_WIDTH}} className="px-2 py-3 text-center">
          Type
        </div>
        <div style={{width: NAME_COL_WIDTH, minWidth: NAME_COL_WIDTH}} className="px-2 py-3">
          Name
        </div>
        <div className="flex-1 relative py-3 h-8 overflow-hidden">
          {yearMarkers.map(({year, left}) => (
            <span
              key={year}
              style={{left: `${left}%`}}
              className="absolute -translate-x-1/2 text-slate-400">
              {year}
            </span>
          ))}
        </div>
      </div>

      {/* Rows */}
      {filtered.map(event => {
        const startMs = new Date(event.startDateTime).getTime();
        const endMs = (event.endDateTime ? new Date(event.endDateTime) : TODAY).getTime();
        const left = Math.max(0, (startMs - minDate.getTime()) / totalMs * 100);
        const width = Math.max(0.5, (endMs - startMs) / totalMs * 100);
        const barColor = STATUS_BAR_COLORS[event.timeStateRelativeToNow] ?? "bg-slate-400";
        const tooltipTitle = `${formatDateTime(event.startDateTime)} — ${event.endDateTime ? formatDateTime(event.endDateTime) : "Ongoing"}`;

        return (
          <div key={event.wikidataId} className="flex border-b border-slate-200 hover:bg-slate-50 min-h-[44px]">
            {/* Type */}
            <div
              style={{width: TYPE_COL_WIDTH, minWidth: TYPE_COL_WIDTH}}
              className="px-2 flex items-center justify-center text-lg text-black">
              <Tooltip title={TYPES[event.type]?.NAME ?? event.type}>
                {TYPE_ICONS[event.type] ?? event.type}
              </Tooltip>
            </div>

            {/* Name */}
            <div
              style={{width: NAME_COL_WIDTH, minWidth: NAME_COL_WIDTH}}
              className="px-2 py-1 flex flex-col justify-center text-sm text-black">
              <div className="font-bold">
                {event.wikipediaUrl
                  ? <a href={event.wikipediaUrl} target="_blank" rel="noreferrer" className="hover:underline">{event.name}</a>
                  : event.name}
                {event.wikidataUrl && (
                  <span className="ml-1 font-normal text-xs text-gray-400">
                    (<a href={event.wikidataUrl} target="_blank" rel="noreferrer" className="hover:underline">{event.wikidataId}</a>)
                  </span>
                )}
              </div>
              {event.description && (
                <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{event.description}</div>
              )}
            </div>

            {/* Timeline */}
            <div className="flex-1 relative flex items-center px-1 min-w-0">
              {/* Year grid lines */}
              {yearMarkers.map(({year, left: yl}) => (
                <div
                  key={year}
                  style={{left: `${yl}%`}}
                  className="absolute top-0 bottom-0 border-l border-slate-100"
                />
              ))}

              {/* Today line */}
              {todayLeft >= 0 && todayLeft <= 100 && (
                <div
                  style={{left: `${todayLeft}%`}}
                  className="absolute top-0 bottom-0 border-l-2 border-red-400 border-dashed z-10"
                />
              )}

              {/* Bar */}
              <Tooltip title={tooltipTitle}>
                <div
                  style={{left: `${left}%`, width: `${width}%`}}
                  className={`absolute h-5 rounded ${barColor} opacity-80 hover:opacity-100 cursor-pointer transition-opacity`}
                />
              </Tooltip>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default EventsTimelineV2;
