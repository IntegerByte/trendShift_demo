import { useState } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cmsApi } from "../services/cmsApi";
import { ToastProvider } from "./ToastContext";
import { AuthProvider, useAuth } from "./AuthContext";
import "../styles/cms.css";

const NAV_ITEMS = [
  { to: "/admin", label: "Overview", icon: "◈", end: true },
  { to: "/admin/services", label: "Services", icon: "✦" },
  { to: "/admin/pages", label: "Pages", icon: "▤" },
  { to: "/admin/case-studies", label: "Case studies", icon: "❖" },
  { to: "/admin/team", label: "Team", icon: "☺" },
  { to: "/admin/partners", label: "Partners", icon: "◆" },
  { to: "/admin/contact-submissions", label: "Contact submissions", icon: "✉" },
  { to: "/admin/navigation", label: "Navigation", icon: "≡" },
];

// Only Super Admins manage who else has admin access — see
// AdminUserViewSet/SuperAdminOnlyPermission on the backend.
const SUPER_ADMIN_NAV_ITEM = { to: "/admin/users", label: "Admin users", icon: "◎" };

function currentTitle(pathname) {
  const allItems = [...NAV_ITEMS, SUPER_ADMIN_NAV_ITEM, { to: "/admin/settings", label: "Site settings" }];
  const match = allItems.find((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to)));
  return match ? match.label : "Overview";
}

function AccountMenu() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  function signOut() {
    cmsApi.logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="cms-account">
      <button type="button" className="cms-account__trigger" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open}>
        <span className="cms-account__avatar">{(user?.username || "?").charAt(0).toUpperCase()}</span>
        {user?.username || "Account"}
      </button>
      {open && (
        <>
          <button type="button" className="cms-account__scrim" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="cms-account__menu" role="menu">
            <Link to="/admin/settings" role="menuitem" onClick={() => setOpen(false)}>
              Site settings
            </Link>
            <button type="button" role="menuitem" onClick={signOut}>
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function AdminChrome() {
  const { pathname } = useLocation();
  const { isSuperAdmin } = useAuth();
  const navItems = isSuperAdmin ? [...NAV_ITEMS, SUPER_ADMIN_NAV_ITEM] : NAV_ITEMS;

  return (
    <ToastProvider>
      <div className="cms-shell">
        <aside className="cms-sidebar">
          <div className="cms-brand">
            <span>TS</span>
            <div>
              <strong>Trendshift</strong>
              <small>Content studio</small>
            </div>
          </div>
          <nav>
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? "is-active" : undefined)}>
                <i>{item.icon}</i>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <a className="cms-view-site" href="/" target="_blank" rel="noreferrer">
            View website ↗
          </a>
        </aside>
        <main className="cms-main">
          <header className="cms-topbar">
            <div>
              <span>Workspace / {currentTitle(pathname)}</span>
              <h1>{currentTitle(pathname)}</h1>
            </div>
            <AccountMenu />
          </header>
          <div className="cms-content">
            <Outlet />
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}

export default function AdminLayout() {
  const isLoggedIn = Boolean(localStorage.getItem("trendshift_cms_token"));

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AuthProvider>
      <AdminChrome />
    </AuthProvider>
  );
}
