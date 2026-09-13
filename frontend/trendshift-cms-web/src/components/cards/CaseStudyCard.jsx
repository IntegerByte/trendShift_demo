import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import RichText from "../common/RichText";

const FALLBACK_IMAGE = "/images/case01.png";

export default function CaseStudyCard({ image, imageAlt, title, description, readMoreTo = null }) {
  return (
    <li>
      <div className="casediv">
        <div className="caseimg">
          <img src={image || FALLBACK_IMAGE} alt={imageAlt} loading="lazy" />
        </div>
        <div className="casetext">
          <h2 className="h2heading">{title}</h2>
          <RichText as="p" html={description} />
          <div className="smbtn">
            {readMoreTo ? <Link to={readMoreTo}>Read more</Link> : <a href="#">Read more</a>}
          </div>
        </div>
      </div>
    </li>
  );
}

CaseStudyCard.propTypes = {
  image: PropTypes.string,
  imageAlt: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  readMoreTo: PropTypes.string,
};
