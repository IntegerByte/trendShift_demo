import PropTypes from "prop-types";

// Shared "not ready yet" UI for API-backed sections — loading, empty, and
// error all render something instead of leaving a blank section (see
// useResource's status values).
export default function StateMessage({ status }) {
  if (status === "loading") {
    return <div className="state-message state-message--loading">Loading…</div>;
  }
  if (status === "error") {
    return (
      <div className="state-message state-message--error">
        <strong>We couldn&rsquo;t load this content.</strong>
        <span>Please check your connection and try again shortly.</span>
      </div>
    );
  }
  return <div className="state-message">Nothing published here yet.</div>;
}

StateMessage.propTypes = {
  status: PropTypes.oneOf(["loading", "empty", "error"]).isRequired,
};
