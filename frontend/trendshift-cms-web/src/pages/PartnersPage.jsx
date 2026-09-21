import SEO from "../components/seo/SEO";
import InnerBanner from "../components/common/InnerBanner";
import SectionHeading from "../components/common/SectionHeading";
import PartnerLogo, { PartnerLogoSkeleton } from "../components/cards/PartnerLogo";
import StateMessage from "../components/common/StateMessage";
import PageIntro from "../components/common/PageIntro";
import { useResource } from "../hooks/useResource";

const BREADCRUMB = [{ label: "Home", to: "/" }, { label: "Partners" }];

// Fallback banner copy — shown until the CMS page record loads, so the
// title and lede always appear together (see HomePage.jsx for why).
const FALLBACK_TITLE = "Partners";
const FALLBACK_LEDE = "We work alongside best-in-class technology platforms to deliver integrated, reliable solutions for our clients.";

// "Why we partner" body comes from the CMS `pages` resource (slug
// "partners"); the logo grid comes from the `partners` resource.
export default function PartnersPage() {
  const { status, data: page } = useResource("pages", { id: "partners" });
  const partners = useResource("partners");

  return (
    <>
      <SEO overrideTitle={status === "ready" && page.meta_title ? page.meta_title : undefined} overrideDescription={status === "ready" ? page.meta_description : undefined} />

      <InnerBanner
        title={status === "ready" ? page.title : FALLBACK_TITLE}
        lede={status === "ready" ? page.short_description?.replace(/<[^>]+>/g, "") : FALLBACK_LEDE}
        breadcrumbItems={BREADCRUMB}
      />

      <section className="smgap aboutwrap">
        <div className="centerdiv clearfix">
          <SectionHeading>Why we partner</SectionHeading>
          {status === "ready" ? (
            <div className="companyinfo">
              <PageIntro html={page.description} />
            </div>
          ) : (
            <StateMessage status={status === "empty" ? "error" : status} />
          )}
        </div>
      </section>

      <section className="smgap partnerswrap">
        <div className="centerdiv clearfix">
          <SectionHeading>Our partners</SectionHeading>
          <ul className="partnerlist">
            {partners.status === "loading" ? (
              Array.from({ length: 12 }).map((_, i) => (
                <PartnerLogoSkeleton key={`partner-skel-${i}`} />
              ))
            ) : (
              (partners.data || []).map((partner) => (
                <PartnerLogo key={partner.id || partner.name} name={partner.name} image={partner.logo} />
              ))
            )}
          </ul>
        </div>
      </section>
    </>
  );
}
