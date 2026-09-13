import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import RichText from "../common/RichText";

export default function ServiceCard({ title, description, readMoreTo = null }) {
  return (
    <li>
      <div className="lightbg">
        <div className="lightheading">
          <h2 className="h2heading">{title}</h2>
        </div>
        <div className="lighttext">
          <RichText as="p" html={description} />
          <div className="smbtn">
            {readMoreTo ? <Link to={readMoreTo}>Read more</Link> : <a href="#">Read more</a>}
          </div>
        </div>
      </div>
    </li>
  );
}

ServiceCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  readMoreTo: PropTypes.string,
};
