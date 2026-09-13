import { Link } from "react-router-dom";
import SEO from "../components/seo/SEO";
import SectionHeading from "../components/common/SectionHeading";
import ServiceCard from "../components/cards/ServiceCard";
import CaseStudyCard from "../components/cards/CaseStudyCard";
import TeamMember from "../components/cards/TeamMember";
import PartnerLogo from "../components/cards/PartnerLogo";
import StateMessage from "../components/common/StateMessage";
import PageIntro from "../components/common/PageIntro";
import { TEAM } from "../data/team";
import { PARTNERS } from "../data/partners";
import { useResource } from "../hooks/useResource";

// Fallback hero copy — shown until the CMS "home" page record loads, so the
// title and lede always appear together instead of the title (which had a
// fallback) popping in immediately while the lede (which didn't) waited
// for the fetch and appeared moments later.
const HERO_FALLBACK_TITLE = "Discover Premium Consulting Services";
const HERO_FALLBACK_LEDE =
  "With + 70 years of combined experience in government relations, growth strategy & technology and " +
  "innovation we specialize in strategic growth consulting to support the leading edge technology and " +
  "innovation companies in the world.";

// Hero heading/lede and the "About us" body come from the CMS `pages`
// resource (slug "home") so they're editable through React Admin; Services,
// Case studies, Team and Partners each pull from their own CMS resource
// (static data/team.js + data/partners.js stay only as offline fallbacks).
export default function HomePage() {
  const page = useResource("pages", { id: "home" });
  const expertise = useResource("expertise");
  const caseStudies = useResource("case-studies");
  const team = useResource("team");
  const partners = useResource("partners");
  const homeServices = expertise.status === "ready" ? expertise.data.slice(0, 4) : [];
  const homeCaseStudies = caseStudies.status === "ready" ? caseStudies.data.slice(0, 3) : [];
  const teamMembers = team.status === "ready" ? team.data : TEAM.map((m) => ({ name: m.name, role: m.role, photo: m.image }));
  const partnerLogos = partners.status === "ready" ? partners.data : PARTNERS.map((p) => ({ name: p.name, logo: p.image }));

  return (
    <>
      <SEO overrideTitle={page.status === "ready" && page.data.meta_title ? page.data.meta_title : undefined} overrideDescription={page.status === "ready" ? page.data.meta_description : undefined} />

      <div className="bannerdiv">
        <img className="bgtop" src="/images/bg.png" alt="bg.png" />
        <div className="bgtext">
          <div className="bglogo">
            <img src="/images/bglogo.png" alt="bglogo" />
          </div>
          <h1>{page.status === "ready" ? page.data.title : HERO_FALLBACK_TITLE}</h1>
          <p>{page.status === "ready" ? page.data.short_description?.replace(/<[^>]+>/g, "") : HERO_FALLBACK_LEDE}</p>
          <a className="downarrow" href="#home-services" aria-label="Scroll to Services">
            <svg width="32" height="17" viewBox="0 0 32 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.5 0.5L16 16L31.5 0.5" stroke="white" strokeLinecap="round" />
            </svg>
          </a>
        </div>
      </div>

      <section className="smgap aboutwrap">
        <div className="centerdiv clearfix">
          <SectionHeading>About us</SectionHeading>
          {page.status === "ready" ? (
            <div className="companyinfo">
              <PageIntro html={page.data.description} />
            </div>
          ) : (
            <StateMessage status={page.status === "empty" ? "error" : page.status} />
          )}
        </div>
      </section>

      <section className="smgap serviceswrap" id="home-services">
        <div className="centerdiv clearfix">
          <SectionHeading>Services</SectionHeading>
          {expertise.status === "ready" || homeServices.length > 0 ? (
            <ul className="smrow servlist">
              {homeServices.map((service) => (
                <ServiceCard
                  key={service.url_key}
                  title={service.title}
                  description={service.short_description}
                  readMoreTo={`/services/${service.url_key}`}
                />
              ))}
            </ul>
          ) : (
            <StateMessage status={expertise.status === "error" ? "error" : expertise.status === "empty" ? "empty" : "loading"} />
          )}
        </div>
      </section>

      <section className="smgap casewrap">
        <div className="centerdiv clearfix">
          <SectionHeading>Case studies</SectionHeading>
          {caseStudies.status === "ready" || homeCaseStudies.length > 0 ? (
            <ul className="smrow caselist">
              {homeCaseStudies.map((item) => (
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
            <StateMessage status={caseStudies.status === "error" ? "error" : caseStudies.status === "empty" ? "empty" : "loading"} />
          )}
        </div>
      </section>

      <section className="smgap teamwrap">
        <div className="centerdiv clearfix">
          <SectionHeading>Meet the Team</SectionHeading>
          <ul className="teamlist">
            <li>
              <div className="team">
                <h2 className="h2heading">
                  We believe the best results come from collaborating with passionate people. Whether you have a
                  vision or need guidance, we&rsquo;re here to help transform challenges into opportunities.
                </h2>
                <h2 className="h2heading">Let&rsquo;s start the conversation and bring your aspirations to life!</h2>
                <div className="smbtn">
                  <Link to="/contact">let&rsquo;s connect</Link>
                </div>
              </div>
            </li>
            <li>
              <div className="teammember">
                {teamMembers.map((member) => (
                  <TeamMember key={member.name} name={member.name} role={member.role} image={member.photo} imageAlt={member.name} />
                ))}
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section className="smgap partnerswrap">
        <div className="centerdiv clearfix">
          <SectionHeading>Partners</SectionHeading>
          <ul className="partnerlist">
            {partnerLogos.map((partner) => (
              <PartnerLogo key={partner.name} name={partner.name} image={partner.logo} />
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
