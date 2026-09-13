import PropTypes from "prop-types";

// CKEditor5 fields on the backend store HTML, not plain text — render it as
// markup instead of an escaped string. Content comes only from
// staff-authenticated CMS editors (Django Admin / the React admin), the
// same trust boundary any CMS content field relies on.
export default function RichText({ html, as: Tag = "div", className }) {
  if (!html) return null;
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

RichText.propTypes = {
  html: PropTypes.string,
  as: PropTypes.elementType,
  className: PropTypes.string,
};
