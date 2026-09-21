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

export function TeamMemberSkeleton() {
  return (
    <div className="collaborating team-skeleton-card" aria-hidden="true">
      <figure>
        <div className="team-skeleton-img" />
      </figure>
      <div className="teamtext">
        <div className="team-skeleton-line team-skeleton-line--title" />
        <div className="team-skeleton-line team-skeleton-line--role" />
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
