import { useState } from "react";
import FormField from "./FormField";
import useCaptcha from "../../hooks/useCaptcha";
import { isValidEmail, isValidPhone } from "../../utils/validators";
import { cmsApi } from "../../services/cmsApi";

const INITIAL_VALUES = { name: "", email: "", phone: "", subject: "", message: "", captcha: "", website: "" };

// Submits to the `contact-submissions` CMS resource (publicly writable,
// staff-only to read — see ContactSubmissionViewSet on the backend), which
// is what powers the Contact submissions list in the admin panel. The
// honeypot field is still sent through so the server-side check (the real
// security boundary) also runs; the captcha stays client-side-only, as a
// UX-level speed bump rather than a security guarantee.
export default function ContactForm() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const captcha = useCaptcha();

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Honeypot: real visitors never fill this hidden field. If it has a
    // value, silently pretend success so bots don't learn they were caught.
    if (values.website.trim() !== "") {
      cmsApi.save("contact-submissions", { ...values, name: values.name || "—", subject: values.subject || "—", message: values.message || "—" }).catch(() => {});
      setValues(INITIAL_VALUES);
      captcha.refresh();
      setAlert({ type: "success", message: "Thank you. Your message has been submitted." });
      return;
    }

    const nextErrors = {};
    if (values.name.trim().length < 2) nextErrors.name = "Please enter your full name.";
    if (!isValidEmail(values.email)) nextErrors.email = "Please enter a valid email address.";
    if (!isValidPhone(values.phone)) nextErrors.phone = "Please enter a valid phone number.";
    if (values.subject.trim().length < 3) nextErrors.subject = "Please enter a subject.";
    if (values.message.trim().length < 10) nextErrors.message = "Please enter at least 10 characters.";
    if (!captcha.verify(values.captcha)) nextErrors.captcha = "Incorrect answer, please try again.";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setAlert({ type: "error", message: "Please correct the highlighted fields and try again." });
      captcha.refresh();
      setValues((prev) => ({ ...prev, captcha: "" }));
      return;
    }

    setSubmitting(true);
    try {
      await cmsApi.save("contact-submissions", {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
      });
      setAlert({
        type: "success",
        message: `Thank you, ${values.name.trim()}. Your message has been submitted and our team will respond shortly.`,
      });
      setValues(INITIAL_VALUES);
      setErrors({});
    } catch (err) {
      setAlert({ type: "error", message: err.message || "Something went wrong sending your message. Please try again." });
    } finally {
      captcha.refresh();
      setSubmitting(false);
    }
  }

  return (
    <>
      {alert && (
        <div className={`form-alert ${alert.type}`} role="status">
          {alert.message}
        </div>
      )}
      <form id="contactForm" noValidate onSubmit={handleSubmit}>
        <div className="formrow">
          <FormField
            id="c-name"
            name="name"
            label="Full name"
            required
            maxLength={80}
            autoComplete="name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
          />
          <FormField
            id="c-email"
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
        <div className="formrow">
          <FormField
            id="c-phone"
            name="phone"
            type="tel"
            label="Phone (optional)"
            maxLength={20}
            autoComplete="tel"
            value={values.phone}
            onChange={handleChange}
            error={errors.phone}
          />
          <FormField
            id="c-subject"
            name="subject"
            label="Subject"
            required
            maxLength={120}
            value={values.subject}
            onChange={handleChange}
            error={errors.subject}
          />
        </div>
        <FormField
          as="textarea"
          id="c-message"
          name="message"
          label="Message"
          required
          rows={5}
          maxLength={1000}
          className="formgroup full"
          value={values.message}
          onChange={handleChange}
          error={errors.message}
        />

        <div className="formgroup full captcha-group">
          <label htmlFor="c-captcha">
            Security check: what is <span className="captcha-question">{captcha.question}</span>?{" "}
            <span className="req">*</span>
          </label>
          <div className="captcha-row">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              id="c-captcha"
              name="captcha"
              maxLength={4}
              required
              value={values.captcha}
              onChange={handleChange}
            />
          </div>
          <span className="field-error">{errors.captcha}</span>
        </div>

        {/* Honeypot: hidden from real visitors, catches automated bots */}
        <div className="hp-field" aria-hidden="true">
          <label htmlFor="c-website">Website</label>
          <input
            type="text"
            id="c-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={handleChange}
          />
        </div>

        <div className="smbtn">
          <button type="submit" disabled={submitting}>
            {submitting ? "Sending…" : "Send message"}
          </button>
        </div>
      </form>
    </>
  );
}
