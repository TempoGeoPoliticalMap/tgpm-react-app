import {useEffect, useState} from "react";

import {axiosInstance} from "../api/api";

export function useEventsV2() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const {data} = await axiosInstance.get("v2/events");

        if (!cancelled) {
          setEvents(data.data);
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
  }, []);

  return {events, loading, error};
}
