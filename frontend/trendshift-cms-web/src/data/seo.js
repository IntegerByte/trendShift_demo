// Per-route SEO metadata, consumed by <SEO> (src/components/seo/SEO.jsx).
// TODO: swap SITE_URL for the real production domain before launch — it
// feeds canonical/OG/twitter URLs and the JSON-LD Organization block.
export const SITE_URL = "https://www.trendshift-example.com";

const OG_IMAGE = "/images/logo.png";

export const SEO_BY_PATH = {
  "/": {
    title: "TrendShift | Premium Growth & Technology Consulting",
    description:
      "TrendShift delivers strategic growth consulting, government relations and technology innovation backed by 70+ years of combined experience.",
    keywords: "TrendShift, growth consulting, strategy consulting, digital transformation, government relations",
  },
  "/services": {
    title: "Our Services | TrendShift",
    description:
      "Explore TrendShift's consulting services: strategic visioning, assessment excellence, professional development and digital transformation for growth-focused organizations.",
    keywords: "TrendShift services, strategic visioning, digital transformation, professional development, growth consulting",
  },
  "/case-studies": {
    title: "Case Studies | TrendShift",
    description:
      "See how TrendShift has helped organizations improve security, accelerate product innovation and streamline IT asset management.",
    keywords: "TrendShift case studies, client results, IT service management, digital transformation case study",
  },
  "/about": {
    title: "About Us | TrendShift",
    description:
      "Learn about TrendShift's mission, values and the team behind 70+ years of combined experience in strategy, growth consulting and technology innovation.",
    keywords: "about TrendShift, TrendShift team, consulting company, mission values",
  },
  "/partners": {
    title: "Partners | TrendShift",
    description:
      "TrendShift partners with leading technology platforms including Adobe, Salesforce, Dropbox and more to deliver best-in-class consulting outcomes.",
    keywords: "TrendShift partners, technology partners, integration partners",
  },
  "/contact": {
    title: "Contact Us | TrendShift",
    description:
      "Get in touch with TrendShift. Send us a message and our team will respond shortly, or reach us by phone or mail.",
    keywords: "contact TrendShift, get in touch, consulting inquiry",
  },
  "/terms": {
    title: "Terms & Conditions | TrendShift",
    description:
      "Read TrendShift's terms and conditions covering use of this website, intellectual property, liability and governing law.",
    keywords: "TrendShift terms and conditions, terms of use, legal",
  },
};

export function buildSeo(pathname) {
  const entry = SEO_BY_PATH[pathname] || SEO_BY_PATH["/"];
  const url = `${SITE_URL}${pathname === "/" ? "/" : pathname}`;
  return {
    ...entry,
    url,
    image: `${SITE_URL}${OG_IMAGE}`,
  };
}
