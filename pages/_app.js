import {useEffect} from "react";

import "../styles/style.css";
import "leaflet/dist/leaflet.css";

const App = ({Component, pageProps}) => {
  useEffect(() => {});

  return (
    <>
      <Component {...pageProps} />
    </>
  );
};

export default App;
