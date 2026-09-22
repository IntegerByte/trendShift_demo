import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { cmsApi } from "../services/cmsApi";
import RichTextEditor from "./RichTextEditor";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";
import FileUpload from "./FileUpload";

function defaultFormValue(field) {
  if (field.type === "checkbox") return false;
  if (field.type === "number") return 0;
  if (field.type === "capabilities") return "";
  if (field.type === "image") return null;
  if (field.type === "select") return field.options?.[0]?.value ?? "";
  return "";
}

function recordToForm(record, fields) {
  const form = {};
  fields.forEach((field) => {
    if (field.type === "capabilities") {
      form[field.name] = (record.capabilities || []).map((c) => c.title).join("\n");
    } else {
      form[field.name] = record[field.name] ?? defaultFormValue(field);
    }
  });
  return form;
}

function emptyForm(fields) {
  const form = {};
  fields.forEach((field) => {
    form[field.name] = defaultFormValue(field);
  });
  return form;
}

// Image fields are never part of the JSON payload — they're uploaded
// separately as multipart requests (see cmsApi.uploadField), since an
// ImageField can't accept its own read URL back as a write value.
function formToPayload(form, fields) {
  const payload = {};
  fields.forEach((field) => {
    if (field.type === "image") return;
    if (field.type === "capabilities") {
      payload.capabilities = form[field.name]
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((title, index) => ({ title, display_order: index }));
    } else if (field.type === "number") {
      payload[field.name] = Number(form[field.name]) || 0;
    } else {
      payload[field.name] = form[field.name];
    }
  });
  return payload;
}

export const ImageField = FileUpload;

// Fields the browser's own HTML5 "required" validation could apply to —
// checkbox/image/richtext/capabilities either can't be blank in a
// meaningful sense or are validated elsewhere.
const VALIDATABLE_TYPES = new Set(["text", "textarea", "number", "select"]);

function validateFields(form, fields) {
  const errors = {};
  fields.forEach((field) => {
    if (!field.required || !VALIDATABLE_TYPES.has(field.type)) return;
    const value = form[field.name];
    if (value === undefined || value === null || String(value).trim() === "") {
      errors[field.name] = `${field.label} is required.`;
    }
  });
  return errors;
}

function RecordForm({ config, initial, onSave, onSaved, onClose }) {
  const toast = useToast();
  const [form, setForm] = useState(initial);
  const [imageFiles, setImageFiles] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial.__id);

  function update(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();

    const nextErrors = validateFields(form, config.fields);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);
    try {
      const saved = await onSave(formToPayload(form, config.fields), initial.__id);
      const id = initial.__id ?? saved?.[config.idField];
      const pending = Object.entries(imageFiles).filter(([, file]) => file);
      for (const [fieldName, file] of pending) {
        await cmsApi.uploadField(config.resource, id, fieldName, file);
      }
      onSaved();
    } catch (err) {
      toast.error(err.message || "Could not save this record. Please check the fields above and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="cms-modal-backdrop" role="dialog" aria-modal="true">
      <section className="cms-modal cms-modal--scroll">
        <div className="cms-modal__heading">
          <div>
            <span className="cms-kicker">Content record</span>
            <h2>{isEdit ? `Edit: ${initial[config.titleField]}` : config.newLabel}</h2>
          </div>
          <button type="button" className="cms-icon-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="cms-modal__body">
            {config.fields.map((field) => (
              <label key={field.name}>
                {field.label}
                {field.hint && field.type !== "image" && <span className="cms-field-hint"> — {field.hint}</span>}
                {field.type === "richtext" ? (
                  <RichTextEditor value={form[field.name]} onChange={(html) => update(field.name, html)} />
                ) : field.type === "image" ? (
                  <ImageField
                    field={field}
                    currentUrl={form[field.name]}
                    file={imageFiles[field.name]}
                    onChange={(file) => setImageFiles((prev) => ({ ...prev, [field.name]: file }))}
                  />
                ) : field.type === "textarea" || field.type === "capabilities" ? (
                  <textarea
                    className={errors[field.name] ? "cms-input--invalid" : undefined}
                    rows={field.rows || 3}
                    value={form[field.name]}
                    onChange={(event) => update(field.name, event.target.value)}
                  />
                ) : field.type === "select" ? (
                  <select value={form[field.name]} onChange={(event) => update(field.name, event.target.value)}>
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <input type="checkbox" checked={form[field.name]} onChange={(event) => update(field.name, event.target.checked)} />
                ) : field.type === "number" ? (
                  <input
                    className={errors[field.name] ? "cms-input--invalid" : undefined}
                    type="number"
                    min="0"
                    value={form[field.name]}
                    onChange={(event) => update(field.name, event.target.value)}
                  />
                ) : (
                  <input
                    className={errors[field.name] ? "cms-input--invalid" : undefined}
                    type="text"
                    value={form[field.name]}
                    onChange={(event) => update(field.name, event.target.value)}
                  />
                )}
                {errors[field.name] && <span className="cms-field-error">{errors[field.name]}</span>}
              </label>
            ))}
          </div>
          <div className="cms-modal__actions">
            <button type="button" className="cms-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="cms-button cms-button--primary" disabled={saving}>
              {saving ? "Saving…" : "Save record"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

RecordForm.propTypes = {
  config: PropTypes.object.isRequired,
  initial: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default function ResourceManager({ config }) {
  const toast = useToast();
  const { isSuperAdmin } = useAuth();
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState("loading");
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => {
    setStatus("loading");
    cmsApi
      .list(config.resource)
      .then((data) => {
        setRecords(data.results || data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [config.resource]);

  useEffect(load, [load]);

  async function handleSave(payload, id) {
    return cmsApi.save(config.resource, payload, id);
  }

  function handleSaved() {
    toast.success(editing?.__id ? "Record updated." : "Record created.");
    setEditing(null);
    load();
  }

  async function handleDelete(record) {
    const label = record[config.titleField];
    const confirmed = await toast.confirm({
      title: "Delete this record?",
      message: `Delete "${label}"? This cannot be undone.`,
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    try {
      await cmsApi.remove(config.resource, record[config.idField]);
      toast.success(`"${label}" was deleted.`);
      load();
    } catch (err) {
      toast.error(err.message || `Could not delete "${label}". Please try again.`);
    }
  }

  async function toggleStatus(record, field) {
    try {
      await cmsApi.update(config.resource, record[config.idField], { [field.name]: !record[field.name] });
      load();
    } catch (err) {
      toast.error(err.message || "Could not update the status of this record. Please try again.");
    }
  }

  async function reorder(record, direction) {
    const sorted = [...records].sort((a, b) => a[config.orderField] - b[config.orderField]);
    const index = sorted.findIndex((r) => r[config.idField] === record[config.idField]);
    const swapWith = sorted[index + direction];
    if (!swapWith) return;
    try {
      await Promise.all([
        cmsApi.update(config.resource, record[config.idField], { [config.orderField]: swapWith[config.orderField] }),
        cmsApi.update(config.resource, swapWith[config.idField], { [config.orderField]: record[config.orderField] }),
      ]);
      load();
    } catch (err) {
      toast.error(err.message || "Could not reorder these records. Please try again.");
    }
  }

  const sortedRecords = config.orderField ? [...records].sort((a, b) => a[config.orderField] - b[config.orderField]) : records;

  return (
    <section>
      <div className="cms-section-heading">
        <div />
        {isSuperAdmin && (
          <button className="cms-button cms-button--primary" onClick={() => setEditing({ __id: null, ...emptyForm(config.fields) })}>
            + Add new
          </button>
        )}
      </div>

      {status === "loading" && <div className="cms-empty">Loading {config.heading.toLowerCase()}…</div>}
      {status === "error" && (
        <div className="cms-empty">
          <strong>Unable to load this section.</strong>
          <span>Check that the Django API is running, then refresh.</span>
        </div>
      )}
      {status === "ready" && sortedRecords.length === 0 && <div className="cms-empty">No records yet.</div>}

      {status === "ready" && sortedRecords.length > 0 && (
        <div className="cms-table-wrap">
          <table>
            <thead>
              <tr>
                {config.orderField && <th>Order</th>}
                <th>Name</th>
                <th>Status</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sortedRecords.map((record, index) => (
                <tr key={record[config.idField]}>
                  {config.orderField && (
                    <td>
                      {isSuperAdmin && (
                        <div className="cms-order">
                          <button disabled={index === 0} onClick={() => reorder(record, -1)} aria-label="Move up">
                            ↑
                          </button>
                          <button disabled={index === sortedRecords.length - 1} onClick={() => reorder(record, 1)} aria-label="Move down">
                            ↓
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                  <td>
                    <strong>{record[config.titleField]}</strong>
                    {config.subtitleField && <small>{record[config.subtitleField]}</small>}
                  </td>
                  <td>
                    {config.statusFields.map((field) =>
                      isSuperAdmin ? (
                        <button
                          key={field.name}
                          className={record[field.name] ? "cms-status" : "cms-status cms-status--muted"}
                          onClick={() => toggleStatus(record, field)}
                          style={{ marginRight: 6 }}
                        >
                          {record[field.name] ? field.on : field.off}
                        </button>
                      ) : (
                        <span
                          key={field.name}
                          className={record[field.name] ? "cms-status" : "cms-status cms-status--muted"}
                          style={{ marginRight: 6 }}
                        >
                          {record[field.name] ? field.on : field.off}
                        </span>
                      )
                    )}
                  </td>
                  <td>{record.updated_at ? new Date(record.updated_at).toLocaleDateString() : "—"}</td>
                  <td className="cms-actions">
                    {isSuperAdmin && (
                      <>
                        <button onClick={() => setEditing({ __id: record[config.idField], ...recordToForm(record, config.fields) })}>Edit</button>
                        <button onClick={() => handleDelete(record)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <RecordForm config={config} initial={editing} onSave={handleSave} onSaved={handleSaved} onClose={() => setEditing(null)} />}
    </section>
  );
}

ResourceManager.propTypes = {
  config: PropTypes.shape({
    resource: PropTypes.string.isRequired,
    idField: PropTypes.string.isRequired,
    titleField: PropTypes.string.isRequired,
    subtitleField: PropTypes.string,
    heading: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    newLabel: PropTypes.string.isRequired,
    orderField: PropTypes.string,
    statusFields: PropTypes.array.isRequired,
    fields: PropTypes.array.isRequired,
  }).isRequired,
};
