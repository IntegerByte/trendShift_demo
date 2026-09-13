import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { MAIN_NAV } from "../../data/siteConfig";
import { useResource } from "../../hooks/useResource";

function isActivePath(pathname, to) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

// CMS-managed navigation items store a bare path in `url`, so they map
// directly onto <Link to>. Only items placed in "header" or "both" show
// here (see NavigationItem.placement) — falls back to the static MAIN_NAV
// list while the API is loading or unreachable, so the header is never
// missing links.
export default function Header({ isMenuOpen, onToggleMenu }) {
  const { pathname } = useLocation();
  const { status, data } = useResource("navigation");
  const navItems =
    status === "ready"
      ? data.filter((item) => item.placement !== "footer").map((item) => ({ to: item.url, label: item.label }))
      : MAIN_NAV;

  return (
    <header id="topwrap" className="headertop">
      <div className="centerdiv clearfix">
        <div className="flextop">
          <span
            className={isMenuOpen ? "toggleicon active" : "toggleicon"}
            role="button"
            tabIndex={0}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            onClick={onToggleMenu}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggleMenu();
              }
            }}
          >
            <svg className="menuicon" width="40" height="27" viewBox="0 0 40 27" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 27H40V22.5H0V27ZM0 15.75H40V11.25H0V15.75ZM0 0V4.5H40V0H0Z" fill="#100224" />
            </svg>
            <svg className="close" width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="0.706956" y1="21.9203" x2="21.9202" y2="0.70713" stroke="white" strokeWidth="2" />
              <line x1="0.707107" y1="0.707078" x2="21.9203" y2="21.9203" stroke="white" strokeWidth="2" />
            </svg>
          </span>

          <div className="logo">
            <Link to="/">
              <img src="/images/logo.png" alt="TrendShift logo" />
            </Link>
          </div>

          <div className="flexmenu">
            <div className="menulogo">
              <Link to="/">
                <img src="/images/logo.png" alt="TrendShift logo" />
              </Link>
            </div>
            <ul>
              {navItems.map((item) => (
                <li key={item.to} className={isActivePath(pathname, item.to) ? "active" : undefined}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  isMenuOpen: PropTypes.bool.isRequired,
  onToggleMenu: PropTypes.func.isRequired,
};
