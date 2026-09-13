import PropTypes from "prop-types";

export default function SectionHeading({ children }) {
  return (
    <div className="smheading">
      <img src="/images/subtraction.png" alt="" aria-hidden="true" /> {children}
    </div>
  );
}

SectionHeading.propTypes = {
  children: PropTypes.node.isRequired,
};
