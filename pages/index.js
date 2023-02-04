import Events from "../src/components/Events";


function Home() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/*  Site header */}
      {/*<Header />*/}

      {/*  Page content */}
      <main className="grow">

        {/*  Page sections */}
        {/*<EventPanel />*/}
        <Events />

      </main>

    </div>
  );
}

export default Home;
