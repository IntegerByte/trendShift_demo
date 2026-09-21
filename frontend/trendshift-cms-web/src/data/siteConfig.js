// Site-wide constants: business info, socials, nav structure.
// Single source of truth — components/pages read from here instead of
// hard-coding the same strings in multiple places.

export const SITE_NAME = "TrendShift";

export const BUSINESS = {
  address: "426 MAIN STREET SUITE 135 SPOTWOOD, NEW JERSEY 08884",
  addressLine1: "426 MAIN STREET SUITE 135 SPOTWOOD, NEW JERSEY 08884",
  phoneDisplay: "+(201) 444-9362",
  phoneHref: "tel:+(201) 444-9362",
  // TODO: replace with the organization's real inbox before launch
  email: "hello@trendshift.com",
  hours: "Monday – Friday, 9:00 AM – 6:00 PM (EST)",
};

// No real social profiles were supplied for this site, so these stay as
// inert placeholders (matching the original static site's behavior)
// rather than linking to invented URLs.
export const SOCIAL_LINKS = [
  { label: "Facebook", href: null },
  { label: "LinkedIn", href: null },
  { label: "Instagram", href: null },
];

// Fallback header menu (only used while the CMS `navigation` resource is
// loading or unreachable) — matches the 3 items an admin configures with
// placement "header" or "both".
export const MAIN_NAV = [
  { label: "Home", to: "/" },
  { label: "Our Services", to: "/services" },
  { label: "Contact Us", to: "/contact" },
];

// Fallback footer menu — matches the 6 items an admin configures with
// placement "footer" or "both". Footer.jsx splits this into two columns.
export const FOOTER_NAV = [
  { label: "Home", to: "/" },
  { label: "Our Services", to: "/services" },
  { label: "Contact Us", to: "/contact" },
  { label: "Case Studies", to: "/case-studies" },
  { label: "Team", to: "/team" },
  { label: "Partners", to: "/partners" },
];
