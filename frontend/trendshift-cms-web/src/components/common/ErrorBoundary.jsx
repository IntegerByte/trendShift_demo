import { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

// Class component is required here — React has no hook-based equivalent
// for componentDidCatch/getDerivedStateFromError yet. Wraps the router so
// a rendering error in one page shows a recoverable fallback instead of a
// blank white screen for the whole app.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // TODO: report to a monitoring service (Sentry, etc.) in production
    // instead of just logging to the console.
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="smgap">
          <div className="centerdiv clearfix">
            <h1 className="h2heading">Something went wrong.</h1>
            <p>
              Please refresh the page. If the problem continues, <Link to="/contact">contact us</Link>.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
