import {useState} from "react";

import MinimalHeader from "../src/components/MinimalHeader";
import EventsV1 from "../src/components/events/EventsV1";
import {mockEventsV1} from "../src/partials/events/mockEventsV1";

const TABS = [
  {label: "Live V1", id: "v1-live"},
  {label: "Mock V1", id: "v1-mock"}
];

function Home() {
  const [activeTab, setActiveTab] = useState("live");

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/*  Site header */}
      {/*<Header />*/}
      <MinimalHeader />
      {/*  Page content */}
      <main className="grow">
        <div className="px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex border-b border-slate-200">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {/* v1 events */}
        {activeTab === "v1-live"
          ? <EventsV1 key="v1-live" />
          : <EventsV1 key="v1-mock" mockData={mockEventsV1} />}
      </main>
    </div>
  );
}

export default Home;
