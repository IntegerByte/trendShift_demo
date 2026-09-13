import { Link } from "react-router-dom";
import SEO from "../components/seo/SEO";
import InnerBanner from "../components/common/InnerBanner";
import SectionHeading from "../components/common/SectionHeading";
import TeamMember from "../components/cards/TeamMember";
import { TEAM } from "../data/team";
import { useResource } from "../hooks/useResource";

const BREADCRUMB = [{ label: "Home", to: "/" }, { label: "Team" }];

// Fallback banner copy — shown until the CMS page record loads, so the
// title and lede always appear together (see HomePage.jsx for why).
const FALLBACK_TITLE = "Team";
const FALLBACK_LEDE = "The people behind every TrendShift engagement.";

// Standalone Team page — its own route/breadcrumb (previously this was
// just an in-page anchor on About, /about#team, showing "About Us" as the
// breadcrumb even though the content was about the team). InnerBanner
// comes from the CMS `pages` resource (slug "team"); team member cards
// come from the `team` resource, same as the Home/About team sections.
export default function TeamPage() {
  const { status, data: page } = useResource("pages", { id: "team" });
  const team = useResource("team");
  const teamMembers = team.status === "ready" ? team.data : TEAM.map((m) => ({ name: m.name, role: m.role, photo: m.image }));

  return (
    <>
      <SEO overrideTitle={status === "ready" && page.meta_title ? page.meta_title : undefined} overrideDescription={status === "ready" ? page.meta_description : undefined} />

      <InnerBanner
        title={status === "ready" ? page.title : FALLBACK_TITLE}
        lede={status === "ready" ? page.short_description?.replace(/<[^>]+>/g, "") : FALLBACK_LEDE}
        breadcrumbItems={BREADCRUMB}
      />

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
    </>
  );
}
