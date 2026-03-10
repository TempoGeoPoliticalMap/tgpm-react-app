import React from "react";

import dynamic from "next/dynamic";

import EventsTableV2 from "../../partials/events/EventsTableV2";
import EventsTimelineV2 from "../../partials/events/EventsTimelineV2";

const EventsMapV2 = dynamic(
  () => import("../../partials/events/EventsMapV2"),
  {ssr: false, loading: () => <div className="p-5 text-slate-400">Loading map…</div>}
);

const EventsCompactV2 = dynamic(
  () => import("../../partials/events/EventsCompactV2"),
  {ssr: false, loading: () => <div className="p-5 text-slate-400">Loading…</div>}
);

function EventsV2({mockData, activeView = "table", typeFilter = [], fromDate = null, toDate = null}) {
  const props = {data: mockData, typeFilter, fromDate, toDate};

  const content = {
    table:    <EventsTableV2 {...props} />,
    timeline: <EventsTimelineV2 {...props} />,
    map:      <EventsMapV2 {...props} />,
    compact:  <EventsCompactV2 {...props} />
  }[activeView];

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-white">
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {content}
          </div>
        </main>
      </div>
    </div>
  );
}

export default EventsV2;
