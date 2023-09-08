import React, {useEffect, useState} from "react";

import {axiosInstance} from "../../api/api";

import EventItem from "./EventsTableItem";

function EventsTable() {
  // eslint-disable-next-line no-unused-vars
  const events = [
    {
      type: "WARFARE_AND_ARMED_CONFLICTS",
      id: "Q1478",
      name: "War in ABC",
      status: "PAST",
      startDateTime: "2023-02-01T22:37:38Z",
      endDateTime: "2023-02-01T22:37:38Z",
      territories: ["GBR", "GER"],
      locations: []
    },
    {
      type: "WARFARE_AND_ARMED_CONFLICTS",
      id: "Q1479",
      name: "War in ABC",
      status: "ONGOING",
      startDateTime: "2023-02-01",
      endDateTime: "2023-02-01",
      territories: ["GBR", "FRA"],
      locations: [
        {geo: "41.40338, 2.17403", name: "Geoloc Name A"},
        {geo: "41.40338, 2.17403", name: "Geoloc Name B"}
      ]
    },
    {
      type: "WARFARE_AND_ARMED_CONFLICTS",
      id: "Q1448",
      name: "War in ABC",
      status: "ONGOING",
      startDateTime: "22/01/2022",
      endDateTime: "23/01/2022",
      territories: ["FRA"],
      locations: []
    },
    {
      type: "WARFARE_AND_ARMED_CONFLICTS",
      id: "Q6478",
      name: "War in ABC",
      status: "FUTURE",
      startDateTime: "22/01/2022",
      endDateTime: "23/01/2022",
      territories: ["GER"],
      locations: []
    },
    {
      type: "WARFARE_AND_ARMED_CONFLICTS",
      id: "Q14678",
      name: "War in ABC",
      status: "UNDEFINED",
      startDateTime: "22/01/2022",
      endDateTime: "23/01/2022",
      territories: ["VIE", "USA"],
      locations: []
    }
  ];

  // const [selectAll, setSelectAll] = useState(false);
  // const [isCheck, setIsCheck] = useState([]);
  // const [isCheck] = useState([]);
  // const [list, setList] = useState([]);
  const [eventsList, setEventsList] = useState([]);

  // GET with Axios
  useEffect(() => {
    const eventsList = async () => {
      let response = await axiosInstance.get("v1/events");
      setEventsList(response.data);
    };
    eventsList();
  }, []);

  // useEffect(() => {
  //   setList(eventsList);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // const handleSelectAll = () => {
  //   setSelectAll(!selectAll);
  //   setIsCheck(list.map(li => li.id));
  //   if (selectAll) {
  //     setIsCheck([]);
  //   }
  // };

  // const handleClick = e => {
  //   const {id, checked} = e.target;
  //   setSelectAll(false);
  //   setIsCheck([...isCheck, id]);
  //   if (!checked) {
  //     setIsCheck(isCheck.filter(item => item !== id));
  //   }
  // };

  // useEffect(() => {
  //   selectedItems(isCheck);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isCheck]);

  return (
    <div className="bg-white">
      <div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-slate-500 border-t border-b border-slate-200">
              <tr>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Type</div>
                </th>
                {/*<th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">*/}
                {/*  <div className="flex items-center">*/}
                {/*    <label className="inline-flex">*/}
                {/*      <span className="sr-only">Select all</span>*/}
                {/*      <input className="form-checkbox" type="checkbox" checked={selectAll} onChange={handleSelectAll} />*/}
                {/*    </label>*/}
                {/*  </div>*/}
                {/*</th>*/}
                {/*<th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">*/}
                {/*  <div className="font-semibold text-left">ID</div>*/}
                {/*</th>*/}
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Name</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-center">Status</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Start Date/Time</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">End Date/Time</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Countries/ Territories</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Geolocations</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-slate-200 border-b border-slate-200">
              {eventsList.map(event => {
                return (
                  <EventItem
                    // key={event.id}
                    key={event.wikidataId}
                    type={event.type}
                    // id={event.id}
                    id={event.wikidataId}
                    name={event.name}
                    // status={event.status}
                    status={event.timeStateRelativeToNow}
                    startDateTime={event.startTime}
                    endDateTime={event.endTime}
                    // territories={event.territories}
                    // territories={"[]"}
                    // locations={event.locations}
                    // locations={"[]"}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EventsTable;
