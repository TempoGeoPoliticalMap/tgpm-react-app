import {useEffect, useState} from "react";

import {DatePicker} from "antd";

import MinimalHeader from "../src/components/MinimalHeader";
import EventsV1 from "../src/components/events/EventsV1";
import EventsV2 from "../src/components/events/EventsV2";
import EventTypeLegendV2 from "../src/partials/events/EventTypeLegendV2";
import {mockEventsV1} from "../src/partials/events/mockEventsV1";
import {mockEventsV2} from "../src/partials/events/mockEventsV2";

const {RangePicker} = DatePicker;

const STORAGE_KEY = "tgpm-header-collapsed";

const VIEWS = [
  {id: "table",    label: "Table"},
  {id: "timeline", label: "Timeline"},
  {id: "map",      label: "Map"},
  {id: "compact",  label: "Compact"}
];

function Home() {
  const [activeTab, setActiveTab] = useState("v2-mock");
  const [activeView, setActiveView] = useState("table");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") setCollapsed(true);
  }, []);

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

  const renderTab = () => {
    switch (activeTab) {
      case "v1-live": return <EventsV1 key="v1-live" />;
      case "v1-mock": return <EventsV1 key="v1-mock" mockData={mockEventsV1} />;
      case "v2-live": return <EventsV2 key="v2-live" activeView={activeView} typeFilter={selectedTypes} fromDate={fromDate} toDate={toDate} />;
      case "v2-mock": return <EventsV2 key="v2-mock" activeView={activeView} mockData={mockEventsV2} typeFilter={selectedTypes} fromDate={fromDate} toDate={toDate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-white">
      <MinimalHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        filtersNode={filtersNode}
        activeView={activeView}
        onViewChange={setActiveView}
        views={VIEWS}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
      <main className="grow" style={{paddingTop: collapsed ? 0 : "36px"}}>
        {renderTab()}
      </main>
    </div>
  );
}

export default Home;
