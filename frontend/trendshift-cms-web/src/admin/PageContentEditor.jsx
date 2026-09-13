import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { cmsApi } from "../services/cmsApi";
import RichTextEditor from "./RichTextEditor";
import { ImageField } from "./ResourceManager";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";

// Edits one specific `pages` record inline (no list table, no modal) —
// for content that conceptually belongs to a single content-type section
// (e.g. the Services page's banner/overview copy) rather than a
// standalone CRUD list. Reuses the same field-type rendering as
// ResourceManager's RecordForm, just for a fixed resource + id.
export default function PageContentEditor({ resource, pageId, heading, description, fields }) {
  const toast = useToast();
  const { isSuperAdmin } = useAuth();
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("loading");
  const [imageFiles, setImageFiles] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStatus("loading");
    cmsApi
      .get(resource, pageId)
      .then((data) => {
        setRecord(data);
        setForm(Object.fromEntries(fields.map((field) => [field.name, data[field.name] ?? (field.type === "checkbox" ? false : "")])));
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, pageId]);

  function update(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      fields.forEach((field) => {
        if (field.type !== "image") payload[field.name] = form[field.name];
      });
      const saved = await cmsApi.update(resource, pageId, payload);
      const pending = Object.entries(imageFiles).filter(([, file]) => file);
      for (const [fieldName, file] of pending) {
        await cmsApi.uploadField(resource, pageId, fieldName, file);
      }
      setRecord(saved);
      setImageFiles({});
      toast.success(`${heading} saved.`);
    } catch (err) {
      toast.error(err.message || `Could not save ${heading.toLowerCase()}. Please check the fields and try again.`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="cms-card">
      <div className="cms-card__heading">
        <span className="cms-kicker">Page content</span>
        <h3>{heading}</h3>
        <p>{description}</p>
      </div>

      {status === "loading" && <div className="cms-empty">Loading…</div>}
      {status === "error" && (
        <div className="cms-empty">
          <strong>Unable to load this section.</strong>
          <span>Check that the Django API is running, then refresh.</span>
        </div>
      )}

      {status === "ready" && (
        <form className="cms-form" onSubmit={submit}>
          {fields.map((field) => (
            <label key={field.name}>
              {field.label}
              {field.hint && field.type !== "image" && <span className="cms-field-hint"> — {field.hint}</span>}
              {field.type === "richtext" ? (
                <RichTextEditor value={form[field.name]} onChange={(html) => update(field.name, html)} />
              ) : field.type === "image" ? (
                <ImageField
                  field={field}
                  currentUrl={record?.[field.name]}
                  file={imageFiles[field.name]}
                  onChange={(file) => setImageFiles((prev) => ({ ...prev, [field.name]: file }))}
                />
              ) : field.type === "textarea" ? (
                <textarea rows={field.rows || 3} value={form[field.name]} onChange={(event) => update(field.name, event.target.value)} disabled={!isSuperAdmin} />
              ) : (
                <input type="text" value={form[field.name]} onChange={(event) => update(field.name, event.target.value)} disabled={!isSuperAdmin} />
              )}
            </label>
          ))}
          {isSuperAdmin && (
            <div className="cms-modal__actions">
              <button type="submit" className="cms-button cms-button--primary" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

PageContentEditor.propTypes = {
  resource: PropTypes.string.isRequired,
  pageId: PropTypes.string.isRequired,
  heading: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  fields: PropTypes.array.isRequired,
};
