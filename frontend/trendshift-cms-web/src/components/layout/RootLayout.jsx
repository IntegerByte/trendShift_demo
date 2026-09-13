import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ScrollManager from "./ScrollManager";
import useMobileMenu from "../../hooks/useMobileMenu";
import { prefetchPublicSite } from "../../app/prefetch";

// Mirrors the original static site's <div class="pagewrap">...</div>
// wrapper. Header and Footer live here so they render once and persist
// across client-side route changes instead of being copy-pasted into (and
// remounted with) every page, as they were in the original 9 HTML files.
export default function RootLayout() {
  const { isOpen, toggle } = useMobileMenu();
  const { pathname } = useLocation();

  // Once, on first mount of the public site: warm every other public
  // page's data + JS chunk in the background, so clicking a nav link is a
  // cache hit even on the very first visit to that page this session.
  useEffect(() => {
    prefetchPublicSite();
  }, []);

  return (
    <div className={isOpen ? "pagewrap active" : "pagewrap"}>
      <ScrollManager />
      <Header isMenuOpen={isOpen} onToggleMenu={toggle} />
      {/* key={pathname} retriggers the CSS fade-in on every navigation
          (including slug-to-slug, e.g. one service detail to another) so
          route changes read as a smooth transition instead of an abrupt
          content swap. */}
      <div key={pathname} className="page-transition">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
