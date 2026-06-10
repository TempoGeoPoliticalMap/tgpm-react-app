import React from "react";
import PropTypes from "prop-types";

import EventMobileCardV2 from "./EventMobileCardV2";

function EventsMobileV2({events = []}) {
  if (!events.length) {
    return <div className="flex items-center justify-center py-16 text-slate-400 text-sm">No events found</div>;
  }

  return (
    <div className="divide-y divide-slate-100 px-4 py-2">
      {events.map(event => (
        <EventMobileCardV2
          key={event.wikidataId}
          type={event.type}
          name={event.name}
          description={event.description}
          timeStateRelativeToNow={event.timeStateRelativeToNow}
          startDateTime={event.startDateTime}
          endDateTime={event.endDateTime}
          wikipediaUrl={event.wikipediaUrl}
          wikidataUrl={event.wikidataUrl}
          imageUrl={event.imageUrl}
        />
      ))}
    </div>
  );
}

EventsMobileV2.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object)
};

export default EventsMobileV2;
