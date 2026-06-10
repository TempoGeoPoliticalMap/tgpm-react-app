import React from "react";
import PropTypes from "prop-types";

import {TYPE_ICONS, TYPES, STATUSES} from "../../constants/eventsV2Types";
import {formatDateTime} from "../../utils/formatDateTime";
import {safeHref} from "../../utils/safeHref";

const STATUS_DOT = {
  ONGOING: "bg-green-500",
  PAST: "bg-slate-400",
  FUTURE: "bg-blue-500"
};

// Wikimedia Special:FilePath supports ?width= for server-side thumbnailing.
function wikimediaThumbnail(url, width) {
  if (!url) return url;
  try {
    const parsed = new URL(url);

    if (parsed.pathname.includes("/Special:FilePath/")) {
      parsed.searchParams.set("width", String(width));
      return parsed.toString();
    }
  } catch {
    // not a valid URL — return as-is
  }
  return url;
}

function EventMobileCardV2({
  type,
  name,
  description,
  timeStateRelativeToNow,
  startDateTime,
  endDateTime,
  wikipediaUrl,
  wikidataUrl,
  imageUrl
}) {
  const titleHref = safeHref(wikipediaUrl) ?? safeHref(wikidataUrl);
  const imgSrc = wikimediaThumbnail(safeHref(imageUrl)?.replace(/^http:\/\//, "https://"), 144);
  const startLabel = formatDateTime(startDateTime);
  const endLabel = timeStateRelativeToNow === "ONGOING" && !endDateTime ? "ongoing" : formatDateTime(endDateTime);
  const dotClass = STATUS_DOT[timeStateRelativeToNow] ?? "bg-slate-400";

  return (
    <div className="flex gap-3 py-3">
      {imgSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgSrc}
          alt={name}
          className="w-18 h-18 rounded object-cover flex-shrink-0"
          style={{width: 72, height: 72}}
        />
      ) : (
        <div
          role="img"
          aria-label={TYPES[type]?.NAME ?? type}
          className="flex items-center justify-center rounded flex-shrink-0 bg-slate-100 text-2xl"
          style={{width: 72, height: 72}}>
          {TYPE_ICONS[type] ?? type}
        </div>
      )}

      <div className="flex flex-col gap-1 min-w-0">
        <div className="font-semibold text-sm leading-snug">
          {titleHref ? (
            <a
              href={titleHref}
              target="_blank"
              rel="noreferrer"
              aria-label={name}
              className="hover:underline text-slate-900">
              {name}
            </a>
          ) : (
            <span className="text-slate-900">{name}</span>
          )}
        </div>

        {description && <div className="text-xs text-slate-500 line-clamp-2">{description}</div>}

        {startLabel && (
          <div className="text-xs text-slate-400">
            {startLabel}
            {endLabel ? ` – ${endLabel}` : ""}
          </div>
        )}

        <div className="flex items-center gap-2 mt-0.5">
          {type && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
              {TYPE_ICONS[type]}
              {TYPES[type]?.NAME ?? type}
            </span>
          )}
          <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${dotClass}`} />
          <span className="text-xs text-slate-400">{STATUSES[timeStateRelativeToNow] ?? timeStateRelativeToNow}</span>
        </div>
      </div>
    </div>
  );
}

EventMobileCardV2.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.string,
  timeStateRelativeToNow: PropTypes.string,
  startDateTime: PropTypes.string,
  endDateTime: PropTypes.string,
  wikipediaUrl: PropTypes.string,
  wikidataUrl: PropTypes.string,
  imageUrl: PropTypes.string
};

export default EventMobileCardV2;
