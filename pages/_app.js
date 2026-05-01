import PropTypes from "prop-types";

import "../styles/style.css";
import "leaflet/dist/leaflet.css";

const App = ({Component, pageProps}) => (
  <>
    <Component {...pageProps} />
  </>
);

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object
};

export default App;
