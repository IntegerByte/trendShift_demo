import { Link } from "react-router-dom";
import SEO from "../components/seo/SEO";
import InnerBanner from "../components/common/InnerBanner";
import SectionHeading from "../components/common/SectionHeading";
import InfoCard from "../components/cards/InfoCard";
import TeamMember from "../components/cards/TeamMember";
import StateMessage from "../components/common/StateMessage";
import PageIntro from "../components/common/PageIntro";
import { MISSION_VISION_VALUES, TEAM } from "../data/team";
import { useResource } from "../hooks/useResource";

const BREADCRUMB = [{ label: "Home", to: "/" }, { label: "About Us" }];

// Fallback banner copy — shown until the CMS page record loads, so the
// title and lede always appear together (see HomePage.jsx for why).
const FALLBACK_TITLE = "About Us";
const FALLBACK_LEDE =
  "70+ years of combined experience in government relations, growth strategy and technology innovation " +
  "— in service of organizations shaping the future.";

// "Our story" body comes from the CMS `pages` resource (slug "about");
// Mission/Vision/Values and the Team grid each pull from their own CMS
// resource (static data/team.js stays only as an offline fallback).
export default function AboutPage() {
  const { status, data: page } = useResource("pages", { id: "about" });
  const values = useResource("values");
  const team = useResource("team");
  const valueCards = values.status === "ready" ? values.data : MISSION_VISION_VALUES;
  const teamMembers = team.status === "ready" ? team.data : TEAM.map((m) => ({ name: m.name, role: m.role, photo: m.image }));

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
          <SectionHeading>Our story</SectionHeading>
          {status === "ready" ? (
            <div className="companyinfo">
              <PageIntro html={page.description} />
            </div>
          ) : (
            <StateMessage status={status === "empty" ? "error" : status} />
          )}
        </div>
      </section>

      <section className="smgap valueswrap">
        <div className="centerdiv clearfix">
          <SectionHeading>Mission, vision &amp; values</SectionHeading>
          <ul className="infogrid">
            {valueCards.map((item) => (
              <InfoCard key={item.title} title={item.title} description={item.description} />
            ))}
          </ul>
        </div>
      </section>

      <section className="smgap teamwrap" id="team">
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
    </>
  );
}
