import React from "react";
import PropTypes from "prop-types";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {error: null};
  }

  static getDerivedStateFromError(error) {
    return {error};
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? <div className="p-5 text-red-500">Something went wrong. Please reload the page.</div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  fallback: PropTypes.node,
  children: PropTypes.node.isRequired
};
