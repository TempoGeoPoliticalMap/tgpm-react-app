import {useEffect, useReducer} from "react";

import {axiosInstance} from "../api/api";

const initialState = {events: [], loading: true, error: null};

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return {...state, loading: true, error: null};
    case "FETCH_SUCCESS": {
      const seen = new Set();

      return {
        events: action.data.filter(e => !seen.has(e.wikidataId) && seen.add(e.wikidataId)),
        loading: false,
        error: null
      };
    }
    case "FETCH_ERROR":
      return {events: [], loading: false, error: action.error};
    default:
      return state;
  }
}

export function useEventsV2({types = [], timeslotStart = null, timeslotEnd = null} = {}) {
  const [{events, loading, error}, dispatch] = useReducer(reducer, initialState);

  const typesKey = [...types].sort().join("\0");

  useEffect(() => {
    let cancelled = false;
    dispatch({type: "FETCH_START"});

    const resolvedTypes = typesKey ? typesKey.split("\0") : [];
    const params = {};

    if (resolvedTypes.length) params.types = resolvedTypes;
    if (timeslotStart) params.timeslot_start = timeslotStart;
    if (timeslotEnd) params.timeslot_end = timeslotEnd;

    (async () => {
      try {
        const {data} = await axiosInstance.get("v2/events", {params});

        if (!cancelled) dispatch({type: "FETCH_SUCCESS", data: data.data});
      } catch (err) {
        if (!cancelled) dispatch({type: "FETCH_ERROR", error: err.message});
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [typesKey, timeslotStart, timeslotEnd]);

  return {events, loading, error};
}
