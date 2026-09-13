import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

// The static site had no 404 case — every URL was a real file, so an
// unknown path was Apache's own 404 page. A client-side router needs an
// explicit catch-all route instead; this is that page.
export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page Not Found | TrendShift</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="innerbanner">
        <div className="centerdiv">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <span aria-current="page">Page Not Found</span>
          </nav>
          <h1>Page Not Found</h1>
          <p className="pagelede">The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.</p>
        </div>
      </div>

      <section className="smgap ctawrap">
        <div className="centerdiv clearfix">
          <div className="smbtn">
            <Link to="/">Back to Home</Link>
          </div>
        </div>
      </section>
    </>
  );
}
