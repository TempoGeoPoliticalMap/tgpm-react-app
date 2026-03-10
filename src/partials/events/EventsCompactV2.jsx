import React, {useEffect, useMemo, useRef, useState} from "react";

import dynamic from "next/dynamic";
import {Tooltip} from "antd";

import {axiosInstance} from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import {TYPES} from "../../constants/eventsV2Types";
import {formatDateTime} from "../../utils/formatDateTime";
import {TYPE_ICONS} from "./EventTypeLegendV2";

const EventsMapV2 = dynamic(
  () => import("./EventsMapV2"),
  {ssr: false, loading: () => <div className="p-3 text-slate-400 text-sm">Loading map…</div>}
);

const TODAY = new Date();
const MIN_PX_PER_MARKER = 40;

const STATUS_BAR_COLORS = {
  PAST:    "bg-green-400",
  ONGOING: "bg-yellow-400",
  FUTURE:  "bg-slate-400"
};

const ROW_HEIGHT = 36;

function buildMarkers(minDate, maxDate, totalMs, availableWidth) {
  const step = (() => {
    const numYears    = maxDate.getFullYear() - minDate.getFullYear() + 1;
    const numDecades  = Math.ceil(numYears / 10);
    const numCenturies = Math.ceil(numYears / 100);
    if (availableWidth / numYears >= MIN_PX_PER_MARKER) return 1;
    if (availableWidth / numDecades >= MIN_PX_PER_MARKER) return 10;
    if (availableWidth / numCenturies >= MIN_PX_PER_MARKER) return 100;
    return 1000;
  })();

  const startYear = Math.floor(minDate.getFullYear() / step) * step;
  const markers = [];
  for (let y = startYear; y <= maxDate.getFullYear(); y += step) {
    const left = (new Date(y, 0, 1).getTime() - minDate.getTime()) / totalMs * 100;
    if (left >= -1 && left <= 101) {
      const label = step === 1 ? String(y) : step === 10 ? `${y}s` : `${y}`;
      markers.push({key: y, label, left: Math.max(0, Math.min(100, left))});
    }
  }
  return markers;
}

function EventsCompactV2({data, typeFilter, statusFilter, regionFilter, fromDate, toDate}) {
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [ganttWidth, setGanttWidth] = useState(600);

  const tableRef = useRef(null);
  const ganttRef = useRef(null);
  const ganttInnerRef = useRef(null);
  const syncing = useRef(false);

  // Measure gantt inner div width via ResizeObserver
  useEffect(() => {
    const el = ganttInnerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      setGanttWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onTableScroll = e => {
    if (syncing.current) return;
    syncing.current = true;
    if (ganttRef.current) ganttRef.current.scrollTop = e.currentTarget.scrollTop;
    syncing.current = false;
  };

  const onGanttScroll = e => {
    if (syncing.current) return;
    syncing.current = true;
    if (tableRef.current) tableRef.current.scrollTop = e.currentTarget.scrollTop;
    syncing.current = false;
  };

  useEffect(() => {
    if (data) {
      setEventsList(data.data);
      setError(null);
      setTimeout(() => setLoading(false), 500);
      return;
    }
    let cancelled = false;
    setLoading(true);
    axiosInstance.get("v2/events")
      .then(r => { if (!cancelled) setEventsList(r.data.data); })
      .catch(() => { if (!cancelled) setError("Failed to load events. Please try again later."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [data]);

  const filtered = useMemo(() => eventsList
    .filter(e => !typeFilter?.length || typeFilter.includes(e.type))
    .filter(e => !statusFilter?.length || statusFilter.includes(e.timeStateRelativeToNow))
    .filter(e => !regionFilter?.length || e.regions?.some(r => regionFilter.includes(r)))
    .filter(e => !fromDate || !e.endDateTime || fromDate.isBefore(e.endDateTime, "day"))
    .filter(e => !toDate || toDate.isAfter(e.startDateTime, "day"))
    .sort((a, b) => {
      const d = new Date(a.startDateTime) - new Date(b.startDateTime);
      if (d !== 0) return d;
      const aEnd = a.endDateTime ? new Date(a.endDateTime) : Infinity;
      const bEnd = b.endDateTime ? new Date(b.endDateTime) : Infinity;
      return aEnd - bEnd;
    }),
    [eventsList, typeFilter, statusFilter, regionFilter, fromDate, toDate]
  );

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

  const markers = useMemo(
    () => buildMarkers(minDate, maxDate, totalMs, ganttWidth),
    [minDate, maxDate, totalMs, ganttWidth]
  );

  const todayLeft = (TODAY.getTime() - minDate.getTime()) / totalMs * 100;

  const mapData = useMemo(() => ({data: filtered}), [filtered]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-5 text-red-500">{error}</div>;

  const headerCls = "sticky top-0 z-10 bg-slate-50 border-b border-slate-200 px-2 py-3 text-xs font-semibold uppercase text-slate-500";

  return (
    <div className="flex border border-slate-200 rounded overflow-hidden" style={{height: "600px"}}>

      {/* ── Table panel — 25% ── */}
      <div
        ref={tableRef}
        className="overflow-y-auto overflow-x-hidden border-r border-slate-200"
        style={{flex: "0 0 25%"}}
        onScroll={onTableScroll}>
        <div className={headerCls}>Name</div>
        {filtered.map(event => {
          const isSelected = selectedEventId === event.wikidataId;
          return (
            <div
              key={event.wikidataId}
              style={{minHeight: ROW_HEIGHT}}
              className={`flex items-center gap-2 px-2 border-b border-slate-200 cursor-pointer text-sm ${isSelected ? "bg-blue-50" : "hover:bg-slate-50"}`}
              onClick={() => setSelectedEventId(prev => prev === event.wikidataId ? null : event.wikidataId)}>
              <span className="text-lg flex-shrink-0 text-black">
                <Tooltip title={TYPES[event.type]?.NAME ?? event.type}>
                  {TYPE_ICONS[event.type] ?? event.type}
                </Tooltip>
              </span>
              <span className="min-w-0">
                <span className="font-bold text-black">
                  {event.wikipediaUrl
                    ? <a href={event.wikipediaUrl} target="_blank" rel="noreferrer" className="hover:underline" onClick={e => e.stopPropagation()}>{event.name}</a>
                    : event.name}
                </span>
                {event.wikidataUrl && (
                  <span className="ml-1 font-normal text-xs text-gray-400">
                    (<a href={event.wikidataUrl} target="_blank" rel="noreferrer" className="hover:underline" onClick={e => e.stopPropagation()}>{event.wikidataId}</a>)
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Gantt panel — 35% ── */}
      <div
        ref={ganttRef}
        className="overflow-auto border-r border-slate-200"
        style={{flex: "0 0 35%"}}
        onScroll={onGanttScroll}>
        <div ref={ganttInnerRef} style={{minWidth: "100%"}}>
          {/* Header: time markers */}
          <div className={`${headerCls} relative h-10 overflow-hidden`}>
            {markers.map(({key, label, left}) => (
              <span
                key={key}
                style={{left: `${left}%`}}
                className="absolute -translate-x-1/2 text-slate-400">
                {label}
              </span>
            ))}
          </div>
          {/* Gantt rows */}
          {filtered.map(event => {
            const startMs = new Date(event.startDateTime).getTime();
            const endMs = (event.endDateTime ? new Date(event.endDateTime) : TODAY).getTime();
            const left = Math.max(0, (startMs - minDate.getTime()) / totalMs * 100);
            const width = Math.max(0.5, (endMs - startMs) / totalMs * 100);
            const barColor = STATUS_BAR_COLORS[event.timeStateRelativeToNow] ?? "bg-slate-400";
            const isSelected = selectedEventId === event.wikidataId;
            const tooltipTitle = `${formatDateTime(event.startDateTime)} — ${event.endDateTime ? formatDateTime(event.endDateTime) : "Ongoing"}`;
            return (
              <div
                key={event.wikidataId}
                style={{minHeight: ROW_HEIGHT}}
                className={`relative flex items-center px-1 border-b border-slate-200 cursor-pointer ${isSelected ? "bg-blue-50" : "hover:bg-slate-50"}`}
                onClick={() => setSelectedEventId(prev => prev === event.wikidataId ? null : event.wikidataId)}>
                {markers.map(({key: mk, left: yl}) => (
                  <div key={mk} style={{left: `${yl}%`}} className="absolute top-0 bottom-0 border-l border-slate-100" />
                ))}
                {todayLeft >= 0 && todayLeft <= 100 && (
                  <div style={{left: `${todayLeft}%`}} className="absolute top-0 bottom-0 border-l-2 border-red-400 border-dashed z-10" />
                )}
                <Tooltip title={tooltipTitle}>
                  <div
                    style={{left: `${left}%`, width: `${width}%`}}
                    className={`absolute h-4 rounded ${barColor} transition-opacity ${isSelected ? "opacity-100 outline outline-2 outline-offset-1 outline-blue-400" : "opacity-75 hover:opacity-100"}`}
                  />
                </Tooltip>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Map panel — 40% ── */}
      <div className="overflow-hidden" style={{flex: "0 0 40%"}}>
        <EventsMapV2
          data={mapData}
          typeFilter={[]}
          statusFilter={[]}
          regionFilter={[]}
          fromDate={null}
          toDate={null}
        />
      </div>
    </div>
  );
}

export default EventsCompactV2;
