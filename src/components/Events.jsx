import React from "react";

import EventsTable from "../partials/events/EventsTable";

import PaginationClassic from "./PaginationClassic";

function Events() {
  // const [sidebarOpen, setSidebarOpen] = useState(false);
  // const [selectedItems, setSelectedItems] = useState([]);
  //
  // const handleSelectedItems = selectedItems => {
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   setSelectedItems([...selectedItems]);
  // };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      {/*<Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />*/}

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-white">
        {/*  Site header */}
        {/*<Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />*/}

        <main>
          {/* Content */}
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Page header */}
            <div className="sm:flex sm:justify-between sm:items-center mb-4 md:mb-2">
              {/* Left: Title */}
              {/*<div className="mb-4 sm:mb-0">*/}
              {/*  <h1 className="text-2xl md:text-3xl text-slate-800 font-bold">$47,347.09</h1>*/}
              {/*</div>*/}

              {/* Right: Actions */}
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {/* Delete button */}
                {/*<DeleteButton selectedItems={selectedItems} />*/}

                {/* Search form */}
                {/*<div className="hidden sm:block">*/}
                {/*  <SearchForm />*/}
                {/*</div>*/}

                {/* Run button */}
                {/*<button className="btn bg-indigo-500 hover:bg-indigo-600 text-white">Run</button>*/}
              </div>
            </div>

            {/* Filters */}
            <div className="sm:block">
              {/*TODO TGPM-1 To implement filtration by type (not it's hardcoded on the backend to "WARFARE_AND_ARMED_CONFLICTS")*/}
              {/*<DropdownFilter />*/}
              {/*TODO TGPM-1 To implement filtration by date (now it's hardcoded on the backend to "Today")*/}
              {/*<DropdownClassic />*/}
            </div>
            {/*<div className="mb-5">*/}
            {/*  <ul className="flex flex-wrap -m-1">*/}
            {/*    <li className="m-1">*/}
            {/*      <button className="inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border border-transparent shadow-sm bg-indigo-500 text-white duration-150 ease-in-out">*/}
            {/*        View All*/}
            {/*      </button>*/}
            {/*    </li>*/}
            {/*    <li className="m-1">*/}
            {/*      <button className="inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border border-slate-200 hover:border-slate-300 shadow-sm bg-white text-slate-500 duration-150 ease-in-out">*/}
            {/*        Warfare & Armed Conflicts*/}
            {/*      </button>*/}
            {/*    </li>*/}
            {/*    <li className="m-1">*/}
            {/*      <button className="inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border border-slate-200 hover:border-slate-300 shadow-sm bg-white text-slate-500 duration-150 ease-in-out">*/}
            {/*        Elections*/}
            {/*      </button>*/}
            {/*    </li>*/}
            {/*    <li className="m-1">*/}
            {/*      <button className="inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border border-slate-200 hover:border-slate-300 shadow-sm bg-white text-slate-500 duration-150 ease-in-out">*/}
            {/*        Political Murders*/}
            {/*      </button>*/}
            {/*    </li>*/}
            {/*  </ul>*/}
            {/*</div>*/}

            {/* Table */}
            {/*<EventsTable selectedItems={handleSelectedItems} />*/}
            <EventsTable />

            {/* Pagination */}
            <div className="mt-8">
              <PaginationClassic />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Events;
