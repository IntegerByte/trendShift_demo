import { Link, useParams } from "react-router-dom";
import SEO from "../components/seo/SEO";
import InnerBanner from "../components/common/InnerBanner";
import SectionHeading from "../components/common/SectionHeading";
import StateMessage from "../components/common/StateMessage";
import RichText from "../components/common/RichText";
import { useResource } from "../hooks/useResource";

// Individual case study detail, fetched by slug from the `case-studies`
// CMS resource (CaseStudy, lookup_field="url_key").
export default function CaseStudyDetailPage() {
  const { slug } = useParams();
  const { status, data: study } = useResource("case-studies", { id: slug, deps: [slug] });

  // No placeholder text for the final crumb while loading — a swapped-in
  // "Case Study Details" label would flash the same way the banner title
  // used to. The segment simply doesn't exist until the real title does.
  const breadcrumb = [
    { label: "Home", to: "/" },
    { label: "Case Studies", to: "/case-studies" },
    ...(status === "ready" ? [{ label: study.title }] : []),
  ];

  if (status !== "ready") {
    return (
      <>
        <SEO />
        <InnerBanner breadcrumbItems={breadcrumb} />
        <section className="smgap">
          <div className="centerdiv clearfix">
            <StateMessage status={status === "empty" ? "error" : status} />
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SEO overrideTitle={study.meta_title || study.title} overrideDescription={study.meta_description} />

      <InnerBanner breadcrumbItems={breadcrumb} />

      {study.image && (
        <section className="smgap">
          <div className="centerdiv clearfix">
            <img src={study.image} alt={study.title} style={{ width: "100%", borderRadius: 4 }} />
          </div>
        </section>
      )}

      <section className="smgap aboutwrap">
        <div className="centerdiv clearfix">
          <SectionHeading>Overview</SectionHeading>
          <div className="companyinfo">
            <div className="smrow aboutrow pageintro">
              <div className="smwidth">
                <h2 className="h2heading">{study.title}</h2>
              </div>
              <div className="smwidth">
                <RichText html={study.description} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {(study.challenge || study.approach || study.outcome) && (
        <section className="smgap">
          <div className="centerdiv clearfix">
            <SectionHeading>Challenge, approach &amp; outcome</SectionHeading>
            <ul className="infogrid">
              <li>
                <div className="casetext">
                  <h2 className="h2heading">The challenge</h2>
                  <RichText html={study.challenge} />
                </div>
              </li>
              <li>
                <div className="casetext">
                  <h2 className="h2heading">Our approach</h2>
                  <RichText html={study.approach} />
                </div>
              </li>
              <li>
                <div className="casetext">
                  <h2 className="h2heading">The outcome</h2>
                  <RichText html={study.outcome} />
                </div>
              </li>
            </ul>
          </div>
        </section>
      )}

      <section className="smgap ctawrap">
        <div className="centerdiv clearfix">
          <div className="smrow">
            <div className="smwidth">
              <h2 className="h2heading">Facing a similar challenge?</h2>
              <p>Tell us about it and we&rsquo;ll show you how we&rsquo;d approach it.</p>
              <div className="smbtn">
                <Link to="/contact">let&rsquo;s connect</Link>
              </div>
            </div>
            <div className="smwidth">
              <h2 className="h2heading">Want to see more client work?</h2>
              <p>Browse the full list of engagements we&rsquo;ve delivered for clients.</p>
              <div className="smbtn">
                <Link to="/case-studies">Back to Case Studies</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
