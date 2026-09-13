import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { cmsApi } from "../services/cmsApi";

function Stat({ label, value, note }) {
  return (
    <div className="cms-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

Stat.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  note: PropTypes.string.isRequired,
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ expertise: null, pages: null, caseStudies: null, unpublished: 0, unreadSubmissions: 0 });

  useEffect(() => {
    Promise.all([cmsApi.list("expertise"), cmsApi.list("pages"), cmsApi.list("case-studies"), cmsApi.list("contact-submissions")])
      .then(([expertise, pages, caseStudies, submissions]) => {
        const unpublished = (expertise.results || expertise).filter((item) => !item.is_published).length;
        const unreadSubmissions = (submissions.results || submissions).filter((item) => !item.is_read).length;
        setCounts({
          expertise: (expertise.results || expertise).length,
          pages: (pages.results || pages).length,
          caseStudies: (caseStudies.results || caseStudies).length,
          unpublished,
          unreadSubmissions,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <section>
      <div className="cms-stats">
        <Stat label="Services" value={counts.expertise ?? "…"} note="Structured content records" />
        <Stat label="Case studies" value={counts.caseStudies ?? "…"} note="Client engagement records" />
        <Stat label="Website pages" value={counts.pages ?? "…"} note="Managed through this CMS" />
      </div>
      {counts.unpublished > 0 && (
        <div className="cms-callout">
          <span>Next best action</span>
          <strong>
            {counts.unpublished} service{counts.unpublished === 1 ? "" : "s"} still unpublished.
          </strong>
          <button onClick={() => navigate("/admin/services")}>Review services →</button>
        </div>
      )}
      {counts.unreadSubmissions > 0 && (
        <div className="cms-callout">
          <span>Next best action</span>
          <strong>
            {counts.unreadSubmissions} unread contact submission{counts.unreadSubmissions === 1 ? "" : "s"}.
          </strong>
          <button onClick={() => navigate("/admin/contact-submissions")}>Review submissions →</button>
        </div>
      )}
    </section>
  );
}
