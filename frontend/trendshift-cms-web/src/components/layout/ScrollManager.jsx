import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// A static multi-page site gets this for free from the browser: a full page
// load starts scrolled at the top, and a URL with a #hash jumps straight to
// that element. A client-side router doesn't do either automatically, so
// this restores both behaviors on every route change (e.g. footer's
// "Team" link to /about#team, or "back to top" navigating between pages).
export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return undefined;
    }

    const id = hash.replace("#", "");
    const scrollToTarget = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return true;
      }
      return false;
    };

    if (scrollToTarget()) return undefined;

    // The target page's content may not have painted yet on the same tick
    // as the route change; retry once shortly after.
    const timeoutId = setTimeout(scrollToTarget, 60);
    return () => clearTimeout(timeoutId);
  }, [pathname, hash]);

  return null;
}
