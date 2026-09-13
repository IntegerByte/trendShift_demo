import SEO from "../components/seo/SEO";
import InnerBanner from "../components/common/InnerBanner";
import CommentSection from "../components/forms/CommentSection";
import StateMessage from "../components/common/StateMessage";
import RichText from "../components/common/RichText";
import { useResource } from "../hooks/useResource";

const BREADCRUMB = [{ label: "Home", to: "/" }, { label: "Terms & Conditions" }];

const COMMENT_SEED = [
  {
    name: "Ibrahim Farouk",
    message: "Appreciate how clearly the liability section is written compared to most vendor terms.",
    date: "Jul 5, 2026",
  },
];

// Fallback banner copy — shown until the CMS page record loads, so the
// title and lede always appear together (see HomePage.jsx for why).
const FALLBACK_TITLE = "Terms & Conditions";
const FALLBACK_LEDE = "Please read these terms carefully before using the TrendShift website.";

// The legal body comes from the CMS `pages` resource (slug "terms") so it's
// editable through React Admin's rich text editor; the comment section
// stays a local static demo feature.
export default function TermsPage() {
  const { status, data: page } = useResource("pages", { id: "terms" });

  return (
    <>
      <SEO overrideTitle={status === "ready" && page.meta_title ? page.meta_title : undefined} overrideDescription={status === "ready" ? page.meta_description : undefined} />

      <InnerBanner
        title={status === "ready" ? page.title : FALLBACK_TITLE}
        lede={status === "ready" ? page.short_description?.replace(/<[^>]+>/g, "") : FALLBACK_LEDE}
        breadcrumbItems={BREADCRUMB}
      />

      <section className="smgap">
        <div className="centerdiv clearfix">
          {status === "ready" ? (
            <RichText html={page.description} className="legalcontent" />
          ) : (
            <StateMessage status={status === "empty" ? "error" : status} />
          )}
        </div>
      </section>

      <CommentSection pageKey="terms" seed={COMMENT_SEED} />
    </>
  );
}
