import React, {useEffect, useMemo, useState} from "react";
import dynamic from "next/dynamic";

import {axiosInstance} from "../../api/api";
import LoadingSpinner from "../LoadingSpinner";
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
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mockData) {
      setEventsList(mockData.data);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get("v2/events");

        if (!cancelled) {
          setEventsList(response.data.data);
          setError(null);
        }
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
  }, [mockData]);

  const filteredEvents = useMemo(
    () => filterAndSortEventsV2(eventsList, {typeFilter, statusFilter: [], regionFilter: [], fromDate, toDate}),
    [eventsList, typeFilter, fromDate, toDate]
  );

  const props = {
    data: mockData,
    typeFilter,
    fromDate,
    toDate,
    events: filteredEvents
  };

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

export default EventsV2;
