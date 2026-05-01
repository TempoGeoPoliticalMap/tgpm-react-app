import React, {useCallback, useMemo, useState} from "react";
import PropTypes from "prop-types";
import L from "leaflet";
import {GeoJSON, MapContainer, Marker, Popup, TileLayer, useMapEvents} from "react-leaflet";

import {STATUSES, TYPES} from "../../constants/eventsV2Types";
import {formatDateTime} from "../../utils/formatDateTime";
import {TYPE_ICONS} from "../../constants/eventsV2Types";
import {safeHref} from "../../utils/safeHref";

// world.geo.json — ~360 KB, feature.id is ISO alpha-3
const GEOJSON_URL = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";

// Maps event country wikidataIds → ISO alpha-3 used in GeoJSON feature.id
const WIKIDATA_TO_ISO = {
  Q212: "UKR",
  Q159: "RUS",
  Q801: "ISR",
  Q219060: "PSE",
  Q1049: "SDN",
  Q836: "MMR",
  Q805: "YEM",
  Q889: "AFG",
  Q30: "USA",
  Q796: "IRQ"
};

const STATUS_MARKER_COLOR = {
  PAST: "#4ade80",
  ONGOING: "#fbbf24",
  FUTURE: "#94a3b8"
};

function parseCoordinate(coordinate) {
  const parts = coordinate.split(",");

  if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) return null;
  const [lat, lng] = parts.map(Number);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return [lat, lng];
}

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

MapClickHandler.propTypes = {
  onMapClick: PropTypes.func.isRequired
};

function EventsMapV2({events = []}) {
  const [geoData, setGeoData] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedCountryIso, setSelectedCountryIso] = useState(null);

  // Fetch country GeoJSON (cached by browser after first load)
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const r = await fetch(GEOJSON_URL);
        const data = await r.json();

        if (!cancelled) setGeoData(data);
      } catch {
        // ignore — map renders without country shading
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ISO → accumulated fill opacity (0.1 per event, max 0.5)
  const countryOpacity = useMemo(() => {
    const map = {};
    events.forEach(event => {
      event.countries?.forEach(c => {
        const iso = WIKIDATA_TO_ISO[c.wikidataId];

        if (iso) map[iso] = Math.min((map[iso] ?? 0) + 0.1, 0.5);
      });
    });
    return map;
  }, [events]);

  // ISOs of countries belonging to the currently selected event
  const selectedEventIsos = useMemo(() => {
    if (!selectedEventId) return new Set();
    const event = events.find(e => e.wikidataId === selectedEventId);

    return new Set(event?.countries?.map(c => WIKIDATA_TO_ISO[c.wikidataId]).filter(Boolean));
  }, [selectedEventId, events]);

  // Event IDs that involve the currently selected country
  const selectedCountryEventIds = useMemo(() => {
    if (!selectedCountryIso) return new Set();
    return new Set(
      events
        .filter(e => e.countries?.some(c => WIKIDATA_TO_ISO[c.wikidataId] === selectedCountryIso))
        .map(e => e.wikidataId)
    );
  }, [selectedCountryIso, events]);

  const geoStyle = useCallback(
    feature => {
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
    },
    [countryOpacity, selectedEventIsos, selectedCountryIso]
  );

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

  return (
    <MapContainer center={[20, 10]} zoom={2} style={{height: "600px", width: "100%"}}>
      <MapClickHandler
        onMapClick={() => {
          setSelectedEventId(null);
          setSelectedCountryIso(null);
        }}
      />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {geoData && <GeoJSON key={geoKey} data={geoData} style={geoStyle} onEachFeature={onEachCountry} />}

      {events.flatMap(event =>
        (event.locations ?? []).map(location => {
          const coords = parseCoordinate(location.coordinate);

          if (!coords) return null;
          const highlighted = event.wikidataId === selectedEventId || selectedCountryEventIds.has(event.wikidataId);

          return (
            <Marker
              key={`${event.wikidataId}-${location.wikidataId}`}
              position={coords}
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
                    {safeHref(event.wikipediaUrl) ? (
                      <a
                        href={safeHref(event.wikipediaUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline">
                        {event.name}
                      </a>
                    ) : (
                      event.name
                    )}
                    {safeHref(event.wikidataUrl) && (
                      <span className="font-normal text-xs text-gray-400">
                        (
                        <a
                          href={safeHref(event.wikidataUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline">
                          {event.wikidataId}
                        </a>
                        )
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

EventsMapV2.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object)
};

export default EventsMapV2;
