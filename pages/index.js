import {useEffect, useState} from "react";
import Head from "next/head";
import {DatePicker} from "antd";

import MinimalHeader from "../src/components/MinimalHeader";
import EventsV2 from "../src/components/events/EventsV2";
import {ErrorBoundary} from "../src/components/ErrorBoundary";
import EventTypeLegendV2 from "../src/partials/events/EventTypeLegendV2";

const STORAGE_KEY = "tgpm-header-collapsed";

const VIEWS = [
  {id: "table", label: "Table"},
  {id: "timeline", label: "Timeline"},
  {id: "map", label: "Map"},
  {id: "compact", label: "Compact"}
];

function Home() {
  const [activeView, setActiveView] = useState("table");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (localStorage.getItem(STORAGE_KEY) === "true") setCollapsed(true);
  }, []);

  const onCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  const filtersNode = (
    <>
      <EventTypeLegendV2 selectedTypes={selectedTypes} onChange={setSelectedTypes} />
      <DatePicker value={fromDate} onChange={setFromDate} placeholder="From date" allowClear style={{width: 121}} />
      <DatePicker value={toDate} onChange={setToDate} placeholder="To date" allowClear style={{width: 121}} />
    </>
  );

  return (
    <>
      <Head>
        <title>TempoGeoPoliticalMap — World Political Events from Wikipedia</title>
      </Head>
      <div className="flex flex-col min-h-screen overflow-hidden bg-white">
        <MinimalHeader
          filtersNode={filtersNode}
          activeView={activeView}
          onViewChange={setActiveView}
          views={VIEWS}
          collapsed={collapsed}
          onCollapse={onCollapse}
        />
        <main className="grow" style={{paddingTop: collapsed ? 0 : "36px"}}>
          <ErrorBoundary>
            <EventsV2 activeView={activeView} typeFilter={selectedTypes} fromDate={fromDate} toDate={toDate} />
          </ErrorBoundary>
        </main>
      </div>
    </>
  );
}

export default Home;
