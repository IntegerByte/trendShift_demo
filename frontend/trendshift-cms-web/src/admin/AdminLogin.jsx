import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cmsApi } from "../services/cmsApi";
import "../styles/cms.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await cmsApi.login(form.username, form.password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="cms-login">
      <div className="cms-login__panel">
        <span className="cms-kicker">Trendshift / CMS</span>
        <h1>Sign in to your workspace</h1>
        <p>Manage the content that powers your public website.</p>
        <form onSubmit={submit}>
          <label>
            Username
            <input
              required
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>
          {error && <div className="cms-error">{error}</div>}
          <button className="cms-button cms-button--primary" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in ↗"}
          </button>
        </form>
      </div>
    </main>
  );
}
