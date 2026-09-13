import PropTypes from "prop-types";

// Reused for "How we work" (services), "Mission, vision & values" (about),
// and "Challenge, approach & outcome" (case study detail) — three sections
// that were near-identical hand-copied markup in the original HTML.
export default function InfoCard({ title, description }) {
  return (
    <li>
      <div className="casetext">
        <img className="infoicon" src="/images/subtraction.png" alt="" aria-hidden="true" />
        <h2 className="h2heading">{title}</h2>
        <p>{description}</p>
      </div>
    </li>
  );
}

InfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};
