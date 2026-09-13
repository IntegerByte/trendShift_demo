import { useState } from "react";
import PropTypes from "prop-types";
import FormField from "./FormField";
import useComments from "../../hooks/useComments";
import { isValidEmail, getInitials, formatCommentDate } from "../../utils/validators";
import SectionHeading from "../common/SectionHeading";

const INITIAL_VALUES = { name: "", email: "", message: "", website: "" };

// Client-side only demo (see hooks/useComments.js) — currently only used on
// the Terms & Conditions page, matching the current site's scope.
export default function CommentSection({ pageKey, seed = [] }) {
  const { comments, addComment } = useComments(pageKey, seed);
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (values.website.trim() !== "") {
      setValues(INITIAL_VALUES);
      return;
    }

    const nextErrors = {};
    if (values.name.trim().length < 2) nextErrors.name = "Please enter your name.";
    if (!isValidEmail(values.email)) nextErrors.email = "Please enter a valid email address.";
    if (values.message.trim().length < 5) nextErrors.message = "Comment is too short.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setAlert({ type: "error", message: "Please correct the highlighted fields." });
      return;
    }

    addComment({
      name: values.name.trim(),
      message: values.message.trim(),
      date: formatCommentDate(),
    });

    setAlert({ type: "success", message: "Thank you, your comment has been posted." });
    setValues(INITIAL_VALUES);
    setErrors({});
  }

  return (
    <section className="smgap commentswrap" id="comments">
      <div className="centerdiv clearfix">
        <SectionHeading>Comments</SectionHeading>

        <div className="commentlist" aria-live="polite">
          {comments.length === 0 ? (
            <p className="commentempty">Be the first to share your thoughts.</p>
          ) : (
            comments.map((comment, index) => (
              <div className="commentitem" key={`${comment.name}-${comment.date}-${index}`}>
                <div className="commentavatar" aria-hidden="true">
                  {getInitials(comment.name)}
                </div>
                <div className="commentbody">
                  <h3>
                    {comment.name} <span>{comment.date}</span>
                  </h3>
                  <p>{comment.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <form className="commentform" noValidate onSubmit={handleSubmit}>
          <h3 className="formtitle">Leave a comment</h3>
          {alert && (
            <div className={`form-alert ${alert.type}`} role="status">
              {alert.message}
            </div>
          )}
          <div className="formrow">
            <FormField
              id="c-comment-name"
              name="name"
              label="Name"
              required
              maxLength={80}
              autoComplete="name"
              value={values.name}
              onChange={handleChange}
              error={errors.name}
            />
            <FormField
              id="c-comment-email"
              name="email"
              type="email"
              label="Email"
              required
              maxLength={120}
              autoComplete="email"
              value={values.email}
              onChange={handleChange}
              error={errors.email}
            />
          </div>
          <FormField
            as="textarea"
            id="c-comment-message"
            name="message"
            label="Comment"
            required
            rows={4}
            maxLength={600}
            className="formgroup full"
            value={values.message}
            onChange={handleChange}
            error={errors.message}
          />
          <div className="hp-field" aria-hidden="true">
            <label htmlFor="c-comment-website">Website</label>
            <input
              type="text"
              id="c-comment-website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={values.website}
              onChange={handleChange}
            />
          </div>
          <div className="smbtn">
            <button type="submit">Post comment</button>
          </div>
        </form>
      </div>
    </section>
  );
}

CommentSection.propTypes = {
  pageKey: PropTypes.string.isRequired,
  seed: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      message: PropTypes.string,
      date: PropTypes.string,
    })
  ),
};
