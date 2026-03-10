import React, {useCallback, useEffect, useMemo, useState} from "react";

import L from "leaflet";
import {GeoJSON, MapContainer, Marker, Popup, TileLayer, useMapEvents} from "react-leaflet";

import {axiosInstance} from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import {STATUSES, TYPES} from "../../constants/eventsV2Types";
import {formatDateTime} from "../../utils/formatDateTime";
import {TYPE_ICONS} from "./EventTypeLegendV2";

// world.geo.json — ~360 KB, feature.id is ISO alpha-3
const GEOJSON_URL = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";

// Maps event country wikidataIds → ISO alpha-3 used in GeoJSON feature.id
const WIKIDATA_TO_ISO = {
  "Q212":    "UKR",
  "Q159":    "RUS",
  "Q801":    "ISR",
  "Q219060": "PSE",
  "Q1049":   "SDN",
  "Q836":    "MMR",
  "Q805":    "YEM",
  "Q889":    "AFG",
  "Q30":     "USA",
  "Q796":    "IRQ"
};

const STATUS_MARKER_COLOR = {
  PAST:    "#4ade80",
  ONGOING: "#fbbf24",
  FUTURE:  "#94a3b8"
};

const createMarkerIcon = (status, highlighted) => {
  const size = highlighted ? 18 : 12;
  const color = STATUS_MARKER_COLOR[status] ?? "#64748b";
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 5px rgba(0,0,0,0.5)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 2]
  });
};

function MapClickHandler({onMapClick}) {
  useMapEvents({click: onMapClick});
  return null;
}

function EventsMapV2({data, typeFilter, statusFilter, regionFilter, fromDate, toDate}) {
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedCountryIso, setSelectedCountryIso] = useState(null);

  // Fetch events
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

  // Fetch country GeoJSON (cached by browser after first load)
  useEffect(() => {
    fetch(GEOJSON_URL)
      .then(r => r.json())
      .then(setGeoData)
      .catch(() => {});
  }, []);

  // Filter + sort (identical to table and timeline)
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

  // ISO → accumulated fill opacity (0.1 per event, max 0.5)
  const countryOpacity = useMemo(() => {
    const map = {};
    filtered.forEach(event => {
      event.countries?.forEach(c => {
        const iso = WIKIDATA_TO_ISO[c.wikidataId];
        if (iso) map[iso] = Math.min((map[iso] ?? 0) + 0.1, 0.5);
      });
    });
    return map;
  }, [filtered]);

  // ISOs of countries belonging to the currently selected event
  const selectedEventIsos = useMemo(() => {
    if (!selectedEventId) return new Set();
    const event = filtered.find(e => e.wikidataId === selectedEventId);
    return new Set(event?.countries?.map(c => WIKIDATA_TO_ISO[c.wikidataId]).filter(Boolean));
  }, [selectedEventId, filtered]);

  // Event IDs that involve the currently selected country
  const selectedCountryEventIds = useMemo(() => {
    if (!selectedCountryIso) return new Set();
    return new Set(filtered
      .filter(e => e.countries?.some(c => WIKIDATA_TO_ISO[c.wikidataId] === selectedCountryIso))
      .map(e => e.wikidataId));
  }, [selectedCountryIso, filtered]);

  const geoStyle = useCallback(feature => {
    const iso = feature.id;
    const base = countryOpacity[iso] ?? 0;
    const highlighted = selectedEventIsos.has(iso) || selectedCountryIso === iso;
    return {
      fillColor: "#ef4444",
      fillOpacity: highlighted ? Math.max(base, 0.4) : base,
      color: "#ef4444",
      weight: highlighted ? 1.5 : 0,
      opacity: highlighted ? 0.8 : 0
    };
  }, [countryOpacity, selectedEventIsos, selectedCountryIso]);

  const onEachCountry = useCallback((feature, layer) => {
    layer.on("click", e => {
      L.DomEvent.stopPropagation(e);
      const iso = feature.id;
      setSelectedCountryIso(prev => (prev === iso ? null : iso));
      setSelectedEventId(null);
    });
  }, []);

  // Key forces GeoJSON layer to re-style when selection changes
  const geoKey = `${selectedEventId ?? "none"}-${selectedCountryIso ?? "none"}`;

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-5 text-red-500">{error}</div>;

  return (
    <MapContainer center={[20, 10]} zoom={2} style={{height: "600px", width: "100%"}}>
      <MapClickHandler onMapClick={() => { setSelectedEventId(null); setSelectedCountryIso(null); }} />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {geoData && (
        <GeoJSON
          key={geoKey}
          data={geoData}
          style={geoStyle}
          onEachFeature={onEachCountry}
        />
      )}

      {filtered.flatMap(event =>
        (event.locations ?? []).map(location => {
          const [lat, lng] = location.coordinate.split(",").map(Number);
          const highlighted =
            event.wikidataId === selectedEventId ||
            selectedCountryEventIds.has(event.wikidataId);
          return (
            <Marker
              key={`${event.wikidataId}-${location.wikidataId}`}
              position={[lat, lng]}
              icon={createMarkerIcon(event.timeStateRelativeToNow, highlighted)}
              eventHandlers={{
                click: e => {
                  L.DomEvent.stopPropagation(e);
                  setSelectedEventId(prev => (prev === event.wikidataId ? null : event.wikidataId));
                  setSelectedCountryIso(null);
                }
              }}>
              <Popup>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-base">{TYPE_ICONS[event.type]}</span>
                    {event.wikipediaUrl
                      ? <a href={event.wikipediaUrl} target="_blank" rel="noreferrer" className="hover:underline">{event.name}</a>
                      : event.name}
                    {event.wikidataUrl && (
                      <span className="font-normal text-xs text-gray-400">
                        (<a href={event.wikidataUrl} target="_blank" rel="noreferrer" className="hover:underline">{event.wikidataId}</a>)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      style={{background: STATUS_MARKER_COLOR[event.timeStateRelativeToNow]}}
                      className="rounded-full px-2 py-0.5 font-medium text-black">
                      {STATUSES[event.timeStateRelativeToNow]}
                    </span>
                    <span className="text-gray-500">
                      {formatDateTime(event.startDateTime)}
                      {event.endDateTime && <> — {formatDateTime(event.endDateTime)}</>}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">{location.name}</div>
                </div>
              </Popup>
            </Marker>
          );
        })
      )}
    </MapContainer>
  );
}

export default EventsMapV2;
