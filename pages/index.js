import {useState} from "react";
import Head from "next/head";
import {DatePicker} from "antd";

import MinimalHeader from "../src/components/MinimalHeader";
import EventsV2 from "../src/components/events/EventsV2";
import {ErrorBoundary} from "../src/components/ErrorBoundary";
import EventTypeLegendV2 from "../src/partials/events/EventTypeLegendV2";

const {RangePicker} = DatePicker;

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
  const [dateRange, setDateRange] = useState([null, null]);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const onCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  const fromDate = dateRange[0] ?? null;
  const toDate = dateRange[1] ?? null;

  const filtersNode = (
    <>
      <EventTypeLegendV2 selectedTypes={selectedTypes} onChange={setSelectedTypes} />
      <RangePicker
        value={dateRange}
        onChange={dates => setDateRange(dates ?? [null, null])}
        allowEmpty={[true, true]}
        placeholder={["From date", "To date"]}
        style={{width: 176}}
      />
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
