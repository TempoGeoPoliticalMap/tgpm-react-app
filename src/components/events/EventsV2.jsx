import React, {useMemo} from "react";
import PropTypes from "prop-types";
import dynamic from "next/dynamic";

import LoadingSpinner from "../LoadingSpinner";
import {useEventsV2} from "../../hooks/useEventsV2";
import {filterAndSortEventsV2} from "../../utils/filterAndSortEventsV2";

const EventsTableV2 = dynamic(() => import("../../partials/events/EventsTableV2"), {
  ssr: false,
  loading: () => <div className="p-5 text-slate-400">Loading table…</div>
});

const EventsTimelineV2 = dynamic(() => import("../../partials/events/EventsTimelineV2"), {
  ssr: false,
  loading: () => <div className="p-5 text-slate-400">Loading timeline…</div>
});

const EventsMapV2 = dynamic(() => import("../../partials/events/EventsMapV2"), {
  ssr: false,
  loading: () => <div className="p-5 text-slate-400">Loading map…</div>
});

const EventsCompactV2 = dynamic(() => import("../../partials/events/EventsCompactV2"), {
  ssr: false,
  loading: () => <div className="p-5 text-slate-400">Loading…</div>
});

function EventsV2({mockData, activeView = "table", typeFilter = [], fromDate = null, toDate = null}) {
  const live = useEventsV2({
    types: typeFilter,
    timeslotStart: fromDate ? fromDate.startOf("day").toISOString() : null,
    timeslotEnd: toDate ? toDate.endOf("day").toISOString() : null
  });

  const rawEvents = mockData ? mockData.data : live.events;
  const loading = mockData ? false : live.loading;
  const error = mockData ? null : live.error;

  const filteredEvents = useMemo(
    () => filterAndSortEventsV2(rawEvents, {typeFilter, statusFilter: [], regionFilter: [], fromDate, toDate}),
    [rawEvents, typeFilter, fromDate, toDate]
  );

  const props = {typeFilter, fromDate, toDate, events: filteredEvents};

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-5 text-red-500">{error}</div>;

  const content = {
    table: <EventsTableV2 {...props} />,
    timeline: <EventsTimelineV2 {...props} />,
    map: <EventsMapV2 {...props} />,
    compact: <EventsCompactV2 {...props} />
  }[activeView];

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-white">
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">{content}</div>
        </main>
      </div>
    </div>
  );
}

EventsV2.propTypes = {
  mockData: PropTypes.shape({data: PropTypes.array}),
  activeView: PropTypes.oneOf(["table", "timeline", "map", "compact"]),
  typeFilter: PropTypes.arrayOf(PropTypes.string),
  fromDate: PropTypes.object,
  toDate: PropTypes.object
};

export default EventsV2;
