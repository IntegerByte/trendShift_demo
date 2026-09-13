import { Link, useParams } from "react-router-dom";
import SEO from "../components/seo/SEO";
import InnerBanner from "../components/common/InnerBanner";
import SectionHeading from "../components/common/SectionHeading";
import StateMessage from "../components/common/StateMessage";
import RichText from "../components/common/RichText";
import { useResource } from "../hooks/useResource";

// Individual expertise/service detail, fetched by slug from the `expertise`
// CMS resource (ExpertiseArea, lookup_field="url_key").
export default function ServiceDetailPage() {
  const { slug } = useParams();
  const { status, data: service } = useResource("expertise", { id: slug, deps: [slug] });

  // No placeholder text for the final crumb while loading — a swapped-in
  // "Service Details" label would flash the same way the banner title used
  // to. The segment simply doesn't exist until the real title does.
  const breadcrumb = [
    { label: "Home", to: "/" },
    { label: "Our Services", to: "/services" },
    ...(status === "ready" ? [{ label: service.title }] : []),
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
      <SEO overrideTitle={service.meta_title || service.title} overrideDescription={service.meta_description} />

      <InnerBanner breadcrumbItems={breadcrumb} />

      <section className="smgap aboutwrap">
        <div className="centerdiv clearfix">
          <SectionHeading>Overview</SectionHeading>
          <div className="companyinfo">
            <div className="smrow aboutrow pageintro">
              <div className="smwidth">
                <h2 className="h2heading">{service.title}</h2>
              </div>
              <div className="smwidth">
                <RichText html={service.description} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {service.capabilities?.length > 0 && (
        <section className="smgap">
          <div className="centerdiv clearfix">
            <SectionHeading>What&rsquo;s included</SectionHeading>
            <ul className="infogrid">
              {service.capabilities.map((capability) => (
                <li key={capability.id}>
                  <div className="casetext">
                    <h3 className="h2heading">{capability.title}</h3>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="smgap ctawrap">
        <div className="centerdiv clearfix">
          <div className="smrow">
            <div className="smwidth">
              <h2 className="h2heading">Interested in this service?</h2>
              <p>Get in touch and we&rsquo;ll walk you through how it applies to your organization.</p>
              <div className="smbtn">
                <Link to="/contact">let&rsquo;s connect</Link>
              </div>
            </div>
            <div className="smwidth">
              <h2 className="h2heading">Want to see the full list first?</h2>
              <p>Browse every service we offer and find the right fit for your organization.</p>
              <div className="smbtn">
                <Link to="/services">Back to Our Services</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
