import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// Replaces the original jQuery toggle ($(".pagewrap, .toggleicon").toggleClass("active")).
// The open/closed state is lifted to RootLayout so both the outer .pagewrap
// element and the header's toggle button can share the same "active" class
// in sync, exactly like the original two-target jQuery toggle did.
export default function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // A full page load always closed the mobile menu on the old static site;
  // client-side route changes must replicate that instead of leaving the
  // menu open over the new page.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return { isOpen, toggle };
}
