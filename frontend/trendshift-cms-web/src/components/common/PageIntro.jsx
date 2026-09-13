import PropTypes from "prop-types";
import RichText from "./RichText";

// The reference design renders an Overview/intro block as two side-by-side
// columns (heading on the left, supporting paragraphs on the right) via
// `.smrow.aboutrow.pageintro > .smwidth`. CMS `description` fields store a
// single rich-text blob (heading + paragraphs together), so this splits off
// the leading heading to feed the two columns separately.
function splitLeadingHeading(html) {
  if (!html) return { headingHtml: "", restHtml: "" };
  const match = html.match(/^\s*(<h([1-6])[^>]*>[\s\S]*?<\/h\2>)/i);
  if (!match) return { headingHtml: "", restHtml: html };
  // CKEditor5/the sanitizer never emit a class attribute on the heading, so
  // add the site's serif heading style (.h2heading) here — it's how the
  // reference design's hardcoded <h2 class="h2heading"> renders.
  const headingHtml = match[1].replace(/^<h([1-6])[^>]*>/i, '<h$1 class="h2heading">');
  return { headingHtml, restHtml: html.slice(match[0].length) };
}

export default function PageIntro({ html }) {
  const { headingHtml, restHtml } = splitLeadingHeading(html);

  if (!headingHtml) {
    return <RichText html={html} className="pageintro" />;
  }

  return (
    <div className="smrow aboutrow pageintro">
      <div className="smwidth">
        <RichText html={headingHtml} />
      </div>
      <div className="smwidth">
        <RichText html={restHtml} />
      </div>
    </div>
  );
}

PageIntro.propTypes = {
  html: PropTypes.string,
};
