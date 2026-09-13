import SEO from "../components/seo/SEO";
import InnerBanner from "../components/common/InnerBanner";
import SectionHeading from "../components/common/SectionHeading";
import CaseStudyCard from "../components/cards/CaseStudyCard";
import StateMessage from "../components/common/StateMessage";
import PageIntro from "../components/common/PageIntro";
import { useResource } from "../hooks/useResource";

const BREADCRUMB = [{ label: "Home", to: "/" }, { label: "Case Studies" }];

// Fallback banner copy — shown until the CMS page record loads, so the
// title and lede always appear together (see HomePage.jsx for why).
const FALLBACK_TITLE = "Case Studies";
const FALLBACK_LEDE = "Real engagements, real outcomes — a look at how we've partnered with clients to solve complex problems.";

// InnerBanner + Overview body come from the CMS `pages` resource (slug
// "case-studies"); the case study cards below come from the `case-studies`
// resource.
export default function CaseStudiesPage() {
  const { status: pageStatus, data: page } = useResource("pages", { id: "case-studies" });
  const caseStudies = useResource("case-studies");

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

      <section className="smgap casewrap">
        <div className="centerdiv clearfix">
          <SectionHeading>Featured work</SectionHeading>
          {caseStudies.status === "ready" ? (
            <ul className="smrow caselist">
              {caseStudies.data.map((item) => (
                <CaseStudyCard
                  key={item.url_key}
                  image={item.image}
                  imageAlt={item.title}
                  title={item.title}
                  description={item.short_description}
                  readMoreTo={`/case-studies/${item.url_key}`}
                />
              ))}
            </ul>
          ) : (
            <StateMessage status={caseStudies.status} />
          )}
        </div>
      </section>
    </>
  );
}
