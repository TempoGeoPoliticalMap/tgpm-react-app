import {useEffect, useState} from "react";

import {axiosInstance} from "../api/api";

export function useEventsV2({types = [], timeslotStart = null, timeslotEnd = null} = {}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const typesKey = [...types].sort().join("\0");

  useEffect(() => {
    let cancelled = false;
    const resolvedTypes = typesKey ? typesKey.split("\0") : [];
    const params = {};

    if (resolvedTypes.length) params.types = resolvedTypes;
    if (timeslotStart) params.timeslot_start = timeslotStart;
    if (timeslotEnd) params.timeslot_end = timeslotEnd;

    (async () => {
      try {
        const {data} = await axiosInstance.get("v2/events", {params});

        if (!cancelled) {
          const seen = new Set();
          setEvents(data.data.filter(e => !seen.has(e.wikidataId) && seen.add(e.wikidataId)));
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [typesKey, timeslotStart, timeslotEnd]);

  return {events, loading, error};
}
