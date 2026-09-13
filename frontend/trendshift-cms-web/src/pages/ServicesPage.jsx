import SEO from "../components/seo/SEO";
import InnerBanner from "../components/common/InnerBanner";
import SectionHeading from "../components/common/SectionHeading";
import ServiceCard from "../components/cards/ServiceCard";
import InfoCard from "../components/cards/InfoCard";
import StateMessage from "../components/common/StateMessage";
import PageIntro from "../components/common/PageIntro";
import { HOW_WE_WORK } from "../data/services";
import { useResource } from "../hooks/useResource";

const BREADCRUMB = [{ label: "Home", to: "/" }, { label: "Our Services" }];

// Fallback banner copy — shown until the CMS page record loads, so the
// title and lede always appear together (see HomePage.jsx for why).
const FALLBACK_TITLE = "Our Services";
const FALLBACK_LEDE =
  "Practical, high-impact consulting across strategy, assessment, talent development and technology — " +
  "built on 70+ years of combined experience.";

// InnerBanner + Overview body come from the CMS `pages` resource (slug
// "services"); the Expertise cards come from `expertise`; "How we work"
// steps come from `process-steps` (static data/services.js is a fallback).
export default function ServicesPage() {
  const { status: pageStatus, data: page } = useResource("pages", { id: "services" });
  const expertise = useResource("expertise");
  const processSteps = useResource("process-steps");
  const howWeWork = processSteps.status === "ready" ? processSteps.data : HOW_WE_WORK;

  return (
    <>
      <SEO overrideTitle={pageStatus === "ready" && page.meta_title ? page.meta_title : undefined} overrideDescription={pageStatus === "ready" ? page.meta_description : undefined} />

      <InnerBanner
        title={pageStatus === "ready" ? page.title : FALLBACK_TITLE}
        lede={pageStatus === "ready" ? page.short_description?.replace(/<[^>]+>/g, "") : FALLBACK_LEDE}
        breadcrumbItems={BREADCRUMB}
      />

      <section className="smgap aboutwrap">
        <div className="centerdiv clearfix">
          <SectionHeading>Overview</SectionHeading>
          {pageStatus === "ready" ? (
            <div className="companyinfo">
              <PageIntro html={page.description} />
            </div>
          ) : (
            <StateMessage status={pageStatus === "empty" ? "error" : pageStatus} />
          )}
        </div>
      </section>

      <section className="smgap serviceswrap serviceswrap-full">
        <div className="centerdiv clearfix">
          <SectionHeading>What we offer</SectionHeading>
          {expertise.status === "ready" ? (
            <ul className="smrow servlist servlist-full">
              {expertise.data.map((service) => (
                <ServiceCard
                  key={service.url_key}
                  title={service.title}
                  description={service.short_description}
                  readMoreTo={`/services/${service.url_key}`}
                />
              ))}
            </ul>
          ) : (
            <StateMessage status={expertise.status} />
          )}
        </div>
      </section>

      <section className="smgap howwework">
        <div className="centerdiv clearfix">
          <SectionHeading>How we work</SectionHeading>
          <ul className="infogrid">
            {howWeWork.map((step) => (
              <InfoCard key={step.title} title={step.title} description={step.description} />
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
