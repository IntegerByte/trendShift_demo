import PropTypes from "prop-types";
import Breadcrumb from "./Breadcrumb";

export default function InnerBanner({ title = null, lede = null, breadcrumbItems }) {
  return (
    <div className="innerbanner">
      <div className="centerdiv">
        <Breadcrumb items={breadcrumbItems} />
        {title && <h1>{title}</h1>}
        {lede && <p className="pagelede">{lede}</p>}
      </div>
    </div>
  );
}

InnerBanner.propTypes = {
  title: PropTypes.string,
  lede: PropTypes.node,
  breadcrumbItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string,
    })
  ).isRequired,
};
