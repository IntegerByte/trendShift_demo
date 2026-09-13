import PropTypes from "prop-types";

export default function PartnerLogo({ name, image }) {
  return (
    <li>
      <div className="pardiv">
        {/* "#" placeholder — no real per-partner URL yet — instead of a
            "javascript:void(0)" href, keeping this an <a> for style.css's
            `.pardiv a` layout/hover styling. */}
        <a href="#">{image ? <img src={image} alt={name} loading="lazy" /> : <span>{name}</span>}</a>
      </div>
    </li>
  );
}

PartnerLogo.propTypes = {
  name: PropTypes.string.isRequired,
  image: PropTypes.string,
};
