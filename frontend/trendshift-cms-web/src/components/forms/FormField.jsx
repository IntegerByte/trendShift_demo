import PropTypes from "prop-types";

// Shared labeled input/textarea + inline error message, used by both the
// contact form and the comment form so the markup/behaviour stays
// identical between them instead of being duplicated.
export default function FormField({
  as = "input",
  type = "text",
  id,
  label,
  required = false,
  error = "",
  className = "formgroup",
  ...rest
}) {
  return (
    <div className={className}>
      <label htmlFor={id}>
        {label} {required && <span className="req">*</span>}
      </label>
      {as === "textarea" ? (
        <textarea id={id} required={required} {...rest} />
      ) : (
        <input id={id} type={type} required={required} {...rest} />
      )}
      <span className="field-error">{error}</span>
    </div>
  );
}

FormField.propTypes = {
  as: PropTypes.oneOf(["input", "textarea"]),
  type: PropTypes.string,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
};
