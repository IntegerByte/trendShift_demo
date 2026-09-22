import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { cmsApi } from "../services/cmsApi";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function DetailModal({ submission, onClose, onToggleRead, onDelete, canManage }) {
  return (
    <div className="cms-modal-backdrop" role="dialog" aria-modal="true">
      <section className="cms-modal">
        <div className="cms-modal__heading">
          <div>
            <span className="cms-kicker">Contact submission</span>
            <h2>{submission.subject}</h2>
          </div>
          <button type="button" className="cms-icon-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="cms-form">
          <label>
            From
            <input type="text" readOnly value={`${submission.name} <${submission.email}>`} />
          </label>
          {submission.phone && (
            <label>
              Phone
              <input type="text" readOnly value={submission.phone} />
            </label>
          )}
          <label>
            Received
            <input type="text" readOnly value={formatDate(submission.created_at)} />
          </label>
          <label>
            Message
            <textarea rows={6} readOnly value={submission.message} />
          </label>
        </div>

        <div className="cms-modal__actions">
          {canManage && (
            <>
              <button type="button" className="cms-button cms-button--danger" onClick={() => onDelete(submission)}>
                Delete
              </button>
              <button type="button" className="cms-button" onClick={() => onToggleRead(submission)}>
                Mark as {submission.is_read ? "unread" : "read"}
              </button>
            </>
          )}
          <button type="button" className="cms-button cms-button--primary" onClick={onClose}>
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

DetailModal.propTypes = {
  submission: PropTypes.shape({
    subject: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    created_at: PropTypes.string,
    message: PropTypes.string,
    is_read: PropTypes.bool,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onToggleRead: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  canManage: PropTypes.bool.isRequired,
};

export default function ContactSubmissionsPage() {
  const toast = useToast();
  const { isSuperAdmin } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [status, setStatus] = useState("loading");
  const [viewing, setViewing] = useState(null);

  const load = useCallback(() => {
    setStatus("loading");
    cmsApi
      .list("contact-submissions")
      .then((data) => {
        setSubmissions(data.results || data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(load, [load]);

  async function openSubmission(submission) {
    setViewing(submission);
    if (!submission.is_read && isSuperAdmin) {
      try {
        const updated = await cmsApi.update("contact-submissions", submission.id, { is_read: true });
        setSubmissions((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setViewing(updated);
      } catch {
        // Non-critical — leave it unread rather than surface an error for a background convenience action.
      }
    }
  }

  async function toggleRead(submission) {
    try {
      const updated = await cmsApi.update("contact-submissions", submission.id, { is_read: !submission.is_read });
      setSubmissions((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setViewing(updated);
    } catch (err) {
      toast.error(err.message || "Could not update this submission. Please try again.");
    }
  }

  async function handleDelete(submission) {
    const confirmed = await toast.confirm({
      title: "Delete this submission?",
      message: `Delete the message from "${submission.name}"? This cannot be undone.`,
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    try {
      await cmsApi.remove("contact-submissions", submission.id);
      toast.success("Submission deleted.");
      setViewing(null);
      load();
    } catch (err) {
      toast.error(err.message || "Could not delete this submission. Please try again.");
    }
  }

  return (
    <section>

      {status === "loading" && <div className="cms-empty">Loading contact submissions…</div>}
      {status === "error" && (
        <div className="cms-empty">
          <strong>Unable to load this section.</strong>
          <span>Check that the Django API is running, then refresh.</span>
        </div>
      )}
      {status === "ready" && submissions.length === 0 && <div className="cms-empty">No submissions yet.</div>}

      {status === "ready" && submissions.length > 0 && (
        <div className="cms-table-wrap">
          <table>
            <thead>
              <tr>
                <th>From</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Received</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id} style={submission.is_read ? undefined : { fontWeight: 700 }}>
                  <td>
                    <strong>{submission.name}</strong>
                    <small>{submission.email}</small>
                  </td>
                  <td>{submission.subject}</td>
                  <td>
                    {isSuperAdmin ? (
                      <button
                        className={submission.is_read ? "cms-status cms-status--muted" : "cms-status"}
                        onClick={() => toggleRead(submission)}
                      >
                        {submission.is_read ? "Read" : "Unread"}
                      </button>
                    ) : (
                      <span className={submission.is_read ? "cms-status cms-status--muted" : "cms-status"}>
                        {submission.is_read ? "Read" : "Unread"}
                      </span>
                    )}
                  </td>
                  <td>{formatDate(submission.created_at)}</td>
                  <td className="cms-actions">
                    <button onClick={() => openSubmission(submission)}>View</button>
                    {isSuperAdmin && <button onClick={() => handleDelete(submission)}>Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewing && (
        <DetailModal submission={viewing} onClose={() => setViewing(null)} onToggleRead={toggleRead} onDelete={handleDelete} canManage={isSuperAdmin} />
      )}
    </section>
  );
}
