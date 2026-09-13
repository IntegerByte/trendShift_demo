import { useCallback, useEffect, useState } from "react";
import { cmsApi } from "../services/cmsApi";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";

const ROLE_LABEL = { admin: "Admin (read-only)", super_admin: "Super Admin (full access)" };

function emptyForm() {
  return { username: "", email: "", password: "", role: "admin", is_active: true };
}

function UserForm({ initial, onSave, onSaved, onClose }) {
  const toast = useToast();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial.__id);

  function update(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { username: form.username, email: form.email, role: form.role, is_active: form.is_active };
      if (form.password) payload.password = form.password;
      await onSave(payload, initial.__id);
      onSaved();
    } catch (err) {
      toast.error(err.message || "Could not save this user. Please check the fields above and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="cms-modal-backdrop" role="dialog" aria-modal="true">
      <section className="cms-modal cms-modal--scroll">
        <div className="cms-modal__heading">
          <div>
            <span className="cms-kicker">Admin user</span>
            <h2>{isEdit ? `Edit: ${initial.username}` : "New admin user"}</h2>
          </div>
          <button type="button" className="cms-icon-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="cms-modal__body">
            <label>
              Username
              <input type="text" required value={form.username} onChange={(event) => update("username", event.target.value)} />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
            </label>
            <label>
              {isEdit ? "New password" : "Password"}
              {isEdit && <span className="cms-field-hint"> — leave blank to keep the current password</span>}
              <input type="password" value={form.password} onChange={(event) => update("password", event.target.value)} />
            </label>
            <label>
              Role
              <select value={form.role} onChange={(event) => update("role", event.target.value)}>
                <option value="admin">{ROLE_LABEL.admin}</option>
                <option value="super_admin">{ROLE_LABEL.super_admin}</option>
              </select>
            </label>
            <label className="cms-check">
              <input type="checkbox" checked={form.is_active} onChange={(event) => update("is_active", event.target.checked)} />
              Active (can sign in)
            </label>
          </div>
          <div className="cms-modal__actions">
            <button type="button" className="cms-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="cms-button cms-button--primary" disabled={saving}>
              {saving ? "Saving…" : "Save user"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function AdminUsersPage() {
  const toast = useToast();
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("loading");
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => {
    setStatus("loading");
    cmsApi
      .list("admin-users")
      .then((data) => {
        setUsers(data.results || data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(load, [load]);

  async function handleSave(payload, id) {
    return cmsApi.save("admin-users", payload, id);
  }

  function handleSaved() {
    toast.success(editing?.__id ? "User updated." : "User created.");
    setEditing(null);
    load();
  }

  async function handleDelete(user) {
    const confirmed = await toast.confirm({
      title: "Delete this user?",
      message: `Delete the account "${user.username}"? This cannot be undone.`,
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    try {
      await cmsApi.remove("admin-users", user.id);
      toast.success(`"${user.username}" was deleted.`);
      load();
    } catch (err) {
      toast.error(err.message || `Could not delete "${user.username}". Please try again.`);
    }
  }

  return (
    <section>
      <div className="cms-section-heading">
        <div />
        <button className="cms-button cms-button--primary" onClick={() => setEditing({ __id: null, ...emptyForm() })}>
          + Add new
        </button>
      </div>

      {status === "loading" && <div className="cms-empty">Loading admin users…</div>}
      {status === "error" && (
        <div className="cms-empty">
          <strong>Unable to load this section.</strong>
          <span>Check that the Django API is running, then refresh.</span>
        </div>
      )}
      {status === "ready" && users.length === 0 && <div className="cms-empty">No admin users yet.</div>}

      {status === "ready" && users.length > 0 && (
        <div className="cms-table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last login</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.username}</strong>
                    {user.email && <small>{user.email}</small>}
                  </td>
                  <td>{ROLE_LABEL[user.role]}</td>
                  <td>
                    <span className={user.is_active ? "cms-status" : "cms-status cms-status--muted"}>{user.is_active ? "Active" : "Disabled"}</span>
                  </td>
                  <td>{user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}</td>
                  <td className="cms-actions">
                    <button
                      onClick={() =>
                        setEditing({
                          __id: user.id,
                          username: user.username,
                          email: user.email || "",
                          password: "",
                          role: user.role,
                          is_active: user.is_active,
                        })
                      }
                    >
                      Edit
                    </button>
                    {user.username !== me?.username && <button onClick={() => handleDelete(user)}>Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <UserForm initial={editing} onSave={handleSave} onSaved={handleSaved} onClose={() => setEditing(null)} />}
    </section>
  );
}
