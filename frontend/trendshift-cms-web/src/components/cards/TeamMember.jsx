import PropTypes from "prop-types";

export default function TeamMember({ name, role, image, imageAlt }) {
  return (
    <div className="collaborating">
      {image && (
        <figure>
          <img src={image} alt={imageAlt || name} loading="lazy" />
        </figure>
      )}
      <div className="teamtext">
        <h3>{name}</h3>
        <p>{role}</p>
      </div>
    </div>
  );
}

TeamMember.propTypes = {
  name: PropTypes.string.isRequired,
  role: PropTypes.string,
  image: PropTypes.string,
  imageAlt: PropTypes.string,
};
