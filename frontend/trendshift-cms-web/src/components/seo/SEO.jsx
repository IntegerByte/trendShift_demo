import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import { buildSeo } from "../../data/seo";
import { SITE_NAME } from "../../data/siteConfig";

// Client-rendered <head> management for this SPA (react-helmet-async).
// Per-route title/description/canonical/OG/Twitter tags come from
// src/data/seo.js, keyed by pathname, so every page only needs `<SEO />`
// with no repeated props — mirrors the per-page <meta> blocks the original
// static HTML files each hand-authored, but from one source of truth.
//
// Known limitation: because this is a client-side-rendered SPA (no
// server/static-generation step), the tags below are applied by JavaScript
// after the initial HTML loads. Search engines that execute JavaScript
// (Google) still index this correctly, but crawlers/bots that don't run JS
// (many social-share unfurlers, some SEO tools) will only see the minimal
// title in index.html until such a step is added.
export default function SEO({ overrideTitle = null, overrideDescription = null }) {
  const { pathname } = useLocation();
  const seo = buildSeo(pathname);
  const title = overrideTitle || seo.title;
  const description = overrideDescription || seo.description;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={seo.keywords} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={seo.url} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={seo.image} />
    </Helmet>
  );
}

SEO.propTypes = {
  overrideTitle: PropTypes.string,
  overrideDescription: PropTypes.string,
};
