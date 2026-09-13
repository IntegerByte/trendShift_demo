import { Link, useRouteError } from "react-router-dom";
import { Helmet } from "react-helmet-async";

// React Router's own errorElement mechanism (distinct from a React error
// boundary) catches render/loader errors within the route tree and swaps
// in this component. src/components/common/ErrorBoundary.jsx is a second,
// outer safety net around the whole app for anything outside the router.
export default function RouteError() {
  const error = useRouteError();

  if (import.meta.env.DEV) {
    console.error("Route error:", error);
  }

  return (
    <div className="pagewrap">
      <Helmet>
        <title>Something Went Wrong | TrendShift</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <section className="smgap">
        <div className="centerdiv clearfix">
          <h1 className="h2heading">Something went wrong.</h1>
          <p>Please refresh the page, or head back to the homepage.</p>
          <div className="smbtn" style={{ marginTop: 20 }}>
            <Link to="/" style={{ color: "#000" }}>
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
