import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
import { cmsApi } from "../services/cmsApi";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";
import FileUpload from "./FileUpload";

const TABS = [
  { key: "general", label: "General" },
  { key: "contact", label: "Contact Information" },
  { key: "configuration", label: "Site Configuration" },
  { key: "password", label: "Change Password" },
];

// SiteSettings + SiteConfiguration + ContactInformation together cover the
// spec's "Site Settings" bucket (site identity, business/contact info,
// social links, logo). Each is effectively a singleton record — this form
// edits the first one found, or creates one on first save.

function useSingleton(resource, fields) {
  const [id, setId] = useState(null);
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState(() => Object.fromEntries(fields.map((f) => [f, ""])));
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    cmsApi
      .list(resource)
      .then((data) => {
        const records = data.results || data;
        const found = records[0];
        if (found) {
          setId(found.id);
          setRecord(found);
          setForm(Object.fromEntries(fields.map((f) => [f, found[f] ?? ""])));
        }
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  async function save() {
    const saved = await cmsApi.save(resource, form, id);
    setId(saved.id);
    setRecord(saved);
    return saved;
  }

  return { id, record, form, setForm, status, save };
}

function TextField({ label, value, onChange, textarea = false, type = "text", disabled = false }) {
  return (
    <label>
      {label}
      {textarea ? (
        <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} />
      )}
    </label>
  );
}

TextField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  textarea: PropTypes.bool,
  type: PropTypes.string,
  disabled: PropTypes.bool,
};

function SettingsCard({ kicker, title, description, status, children }) {
  return (
    <div className="cms-card">
      <div className="cms-card__heading">
        <span className="cms-kicker">{kicker}</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {status === "loading" ? <div className="cms-empty">Loading…</div> : children}
    </div>
  );
}

SettingsCard.propTypes = {
  kicker: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default function SiteSettingsPage() {
  const toast = useToast();
  const { isSuperAdmin } = useAuth();
  const readOnly = !isSuperAdmin;
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.some((tab) => tab.key === searchParams.get("tab")) ? searchParams.get("tab") : "general";
  const identity = useSingleton("site-settings", ["site_name", "email_from"]);
  const contact = useSingleton("contact", ["business_name", "email", "phone", "address", "business_hours", "facebook_url", "linkedin_url", "instagram_url"]);
  const configuration = useSingleton("site-configuration", ["address", "contact_details", "copyright_text"]);
  const [logoFile, setLogoFile] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  async function submit(event, group, label) {
    event.preventDefault();
    try {
      const saved = await group.save();
      if (group === configuration && logoFile) {
        await cmsApi.uploadField("site-configuration", saved.id, "logo", logoFile);
        setLogoFile(null);
      }
      toast.success(`${label} saved.`);
    } catch (err) {
      toast.error(err.message || `Could not save ${label.toLowerCase()}. Please check the fields and try again.`);
    }
  }

  async function submitPasswordChange(event) {
    event.preventDefault();
    if (passwordForm.next !== passwordForm.confirm) {
      toast.error("New password and confirmation don't match.");
      return;
    }
    setChangingPassword(true);
    try {
      await cmsApi.changePassword(passwordForm.current, passwordForm.next);
      setPasswordForm({ current: "", next: "", confirm: "" });
      toast.success("Password changed.");
    } catch (err) {
      toast.error(err.message || "Could not change your password. Please try again.");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <section>
      <div className="cms-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={activeTab === tab.key ? "is-active" : undefined}
            onClick={() => setSearchParams(tab.key === "general" ? {} : { tab: tab.key })}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="cms-settings-grid">
        {activeTab === "general" && (
          <SettingsCard kicker="Site identity" title="General" description="The site's name and default sending address." status={identity.status}>
            <form className="cms-form" onSubmit={(event) => submit(event, identity, "General settings")}>
              <TextField label="Site name" value={identity.form.site_name} onChange={(v) => identity.setForm({ ...identity.form, site_name: v })} disabled={readOnly} />
              <TextField label="Email from" value={identity.form.email_from} onChange={(v) => identity.setForm({ ...identity.form, email_from: v })} disabled={readOnly} />
              <div className="cms-modal__actions">
                <button type="submit" className="cms-button cms-button--primary" disabled={readOnly} title={readOnly ? "Only Super Admins can make changes" : undefined}>
                  Save general settings
                </button>
              </div>
            </form>
          </SettingsCard>
        )}

        {activeTab === "contact" && (
          <SettingsCard
            kicker="Public contact card"
            title="Contact Information"
            description="Shown in the site footer and on the Contact page."
            status={contact.status}
          >
            <form className="cms-form" onSubmit={(event) => submit(event, contact, "Contact information")}>
              <TextField label="Business name" value={contact.form.business_name} onChange={(v) => contact.setForm({ ...contact.form, business_name: v })} disabled={readOnly} />
              <div className="cms-form-grid">
                <TextField label="Email" value={contact.form.email} onChange={(v) => contact.setForm({ ...contact.form, email: v })} disabled={readOnly} />
                <TextField label="Phone" value={contact.form.phone} onChange={(v) => contact.setForm({ ...contact.form, phone: v })} disabled={readOnly} />
              </div>
              <TextField label="Address" value={contact.form.address} onChange={(v) => contact.setForm({ ...contact.form, address: v })} textarea disabled={readOnly} />
              <TextField label="Business hours" value={contact.form.business_hours} onChange={(v) => contact.setForm({ ...contact.form, business_hours: v })} disabled={readOnly} />
              <div className="cms-form-grid">
                <TextField label="Facebook URL" value={contact.form.facebook_url} onChange={(v) => contact.setForm({ ...contact.form, facebook_url: v })} disabled={readOnly} />
                <TextField label="LinkedIn URL" value={contact.form.linkedin_url} onChange={(v) => contact.setForm({ ...contact.form, linkedin_url: v })} disabled={readOnly} />
                <TextField label="Instagram URL" value={contact.form.instagram_url} onChange={(v) => contact.setForm({ ...contact.form, instagram_url: v })} disabled={readOnly} />
              </div>
              <div className="cms-modal__actions">
                <button type="submit" className="cms-button cms-button--primary" disabled={readOnly} title={readOnly ? "Only Super Admins can make changes" : undefined}>
                  Save Contact Information
                </button>
              </div>
            </form>
          </SettingsCard>
        )}

        {activeTab === "configuration" && (
          <SettingsCard
            kicker="Branding"
            title="Site Configuration"
            description="Logo, footer address, extra contact details and copyright text."
            status={configuration.status}
          >
            <form className="cms-form" onSubmit={(event) => submit(event, configuration, "Site configuration")}>
              <div className="cms-field-block">
                <label htmlFor="site-logo-upload">Logo</label>
                <FileUpload
                  id="site-logo-upload"
                  currentUrl={configuration.record?.logo}
                  file={logoFile}
                  onChange={setLogoFile}
                  disabled={readOnly}
                  hint="PNG, SVG, JPG or WebP recommended. Transparent background works best."
                />
              </div>
              <TextField label="Address (footer)" value={configuration.form.address} onChange={(v) => configuration.setForm({ ...configuration.form, address: v })} textarea disabled={readOnly} />
              <TextField
                label="Additional contact details"
                value={configuration.form.contact_details}
                onChange={(v) => configuration.setForm({ ...configuration.form, contact_details: v })}
                textarea
                disabled={readOnly}
              />
              <TextField label="Copyright text" value={configuration.form.copyright_text} onChange={(v) => configuration.setForm({ ...configuration.form, copyright_text: v })} disabled={readOnly} />
              <div className="cms-modal__actions">
                <button type="submit" className="cms-button cms-button--primary" disabled={readOnly} title={readOnly ? "Only Super Admins can make changes" : undefined}>
                  Save Site Configuration
                </button>
              </div>
            </form>
          </SettingsCard>
        )}

        {activeTab === "password" && (
          <SettingsCard kicker="Your account" title="Change Password" description="Available to every role — it only changes your own sign-in password." status="ready">
            <form className="cms-form" onSubmit={submitPasswordChange}>
              <TextField
                label="Current password"
                type="password"
                value={passwordForm.current}
                onChange={(v) => setPasswordForm((prev) => ({ ...prev, current: v }))}
              />
              <TextField
                label="New password"
                type="password"
                value={passwordForm.next}
                onChange={(v) => setPasswordForm((prev) => ({ ...prev, next: v }))}
              />
              <TextField
                label="Confirm new password"
                type="password"
                value={passwordForm.confirm}
                onChange={(v) => setPasswordForm((prev) => ({ ...prev, confirm: v }))}
              />
              <div className="cms-modal__actions">
                <button type="submit" className="cms-button cms-button--primary" disabled={changingPassword}>
                  {changingPassword ? "Changing…" : "Change password"}
                </button>
              </div>
            </form>
          </SettingsCard>
        )}
      </div>
    </section>
  );
}
