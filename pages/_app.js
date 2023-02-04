import {useEffect} from "react";

import "../styles/style.css";

const App = ({Component, pageProps}) => {
  useEffect(() => {
  });

  return (
    <>
      <Component {...pageProps} />
    </>
  );
};

export default App;
