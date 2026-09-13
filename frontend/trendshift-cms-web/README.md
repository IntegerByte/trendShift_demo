# TrendShift — React Website

React single-page application for the TrendShift marketing site (Home, Our
Services + detail, Case Studies + detail, About, Partners, Contact, Terms &
Conditions).

The original hand-authored static HTML/CSS/jQuery site this was converted
from is preserved unchanged in [`HTML/`](./HTML) for reference — it is not
part of the React build and is not deployed.

## Stack

- **React 18** + **React Router v6** (client-side routed SPA, `createBrowserRouter`)
- **Vite** — dev server + production bundler (code-split per route, hashed/cacheable assets)
- **react-helmet-async** — per-page `<title>`/meta/canonical/OG tags
- **prop-types** — runtime prop validation (plain JavaScript project, no TypeScript)
- Plain global CSS (`src/styles/style.css`, `src/styles/pages.css`) — the exact same stylesheet
  content as the original static site, so the design is pixel-identical
- No jQuery — the mobile menu toggle, contact form + math captcha, and comment
  section were reimplemented as React state/hooks instead of carrying the
  jQuery dependency into the SPA

## Prerequisites

This machine did not have Node.js installed while this project was authored,
so the code below has **not** been run/built here — it was written directly
against the React/Vite/React Router APIs and cross-checked file-by-file, but
you should run through the steps below yourself before treating it as
production-ready.

Install **Node.js 18 or newer** (LTS): https://nodejs.org/

Verify:

```
node -v
npm -v
```

## Local development

```
npm install
npm run dev
```

Opens the dev server (default `http://localhost:5173`) with hot module
reloading.

## Production build

```
npm run build
```

Outputs a fully static site to `dist/` — HTML, hashed/fingerprinted JS and
CSS bundles, and everything from `public/` (images, `robots.txt`,
`sitemap.xml`, `.htaccess`) copied to the root of `dist/`.

Preview the production build locally before deploying:

```
npm run preview
```

## Linting / formatting

```
npm run lint
npm run format
```

## Deploying to Apache/XAMPP (this project's `htdocs`)

1. Run `npm run build`.
2. Copy the **contents** of `dist/` into the web root you want to serve from
   (e.g. this project's `htdocs/CMS-trendShift/` folder, replacing anything
   previously there — the old static files already live safely in `HTML/`).
3. Confirm `.htaccess` made it into that folder (browsers/some file managers
   hide dotfiles — check with `ls -la` / "show hidden files").
4. Make sure Apache has `mod_rewrite` and `mod_headers` enabled (this
   XAMPP's `apache/conf/httpd.conf` had `mod_headers` on but
   `mod_deflate`/`mod_expires` commented out at the time this project was
   built — every directive in `.htaccess` is `<IfModule>`-guarded, so it's
   safe either way, but compression/expiry caching won't take effect until
   those modules are enabled).

### Deploying to a sub-folder instead of a domain root

If the site won't live at the root of its domain (e.g.
`example.com/trendshift/` instead of `example.com/`), two things need to
change together before building:

- `vite.config.js` → set `base: "/trendshift/"`
- `public/.htaccess` → set `RewriteBase /trendshift/`

### Why `.htaccess` has a rewrite rule

This is a client-side-routed SPA: only `index.html` is ever served by
Apache, and React Router decides what to render based on the URL. Without
the rewrite rule in `public/.htaccess`, a direct visit or refresh on, say,
`/contact` would 404 (no `contact.html` file exists) — Apache needs to be
told to fall back to `index.html` for any path that isn't a real file, so
React Router can take over.

## SEO note (read this)

Per the chosen architecture (client-side-rendered SPA via Vite + React
Router, not Next.js/SSR), `<title>`/meta tags are applied **after** the
JavaScript bundle runs (`src/components/seo/SEO.jsx`), not baked into the
HTML Apache serves. Search engines that execute JavaScript (Google, Bing)
still index this correctly, but some crawlers and social-share link
unfurlers that don't run JavaScript (many are JS-capable today, but not
all) will only see the generic title in `index.html` until a prerendering
or static-generation step is added. `public/robots.txt` and
`public/sitemap.xml` are otherwise fully set up and reference the clean
(no `.html`) route paths this app uses.

If SEO for non-JS crawlers becomes a priority later, the standard fixes
are: add a prerendering build step (e.g. a small script using
`react-dom/server`, or a tool like `vite-plugin-prerender`), or migrate to
a framework with built-in static generation (Next.js `output: "export"`).

## Project structure

```
src/
  app/            Router config + route-level error boundary
  components/
    layout/       Header, Footer, RootLayout (shared shell), ScrollManager
    common/       Breadcrumb, InnerBanner, SectionHeading, ErrorBoundary
    seo/          SEO (react-helmet-async wrapper)
    cards/        Presentational list-item components (ServiceCard, etc.)
    forms/        ContactForm, CommentSection, FormField
  data/           Content as data (services, case studies, partners, team,
                   nav structure, per-route SEO metadata) — single source of
                   truth instead of content duplicated across page markup
  hooks/          useMobileMenu, useCaptcha, useComments
  pages/          One component per route
  styles/         Global CSS, unchanged from the original static site
  utils/          Validation helpers
public/           Static assets served as-is: images, robots.txt, sitemap.xml, .htaccess
HTML/             The original static HTML/CSS/JS site (reference only, not built/deployed)
```

## Functional parity notes

- Routes use clean paths instead of `.html` files (e.g. `/services`,
  `/services/detail` instead of `services.html`, `service-detail.html`).
  `sitemap.xml` and internal navigation were updated to match.
- The contact form's math captcha and validation, and the Terms page's
  comment section (client-side, `localStorage`-backed demo — see the
  `TODO: backend` markers in `src/hooks/useComments.js` and
  `src/components/forms/ContactForm.jsx`), behave identically to the
  original jQuery implementation.
- The mobile hamburger menu behaves identically, and is now also keyboard
  operable (Enter/Space), which the original jQuery version was not — a
  pure accessibility addition, not a behavior change.
- The footer's "Team" link and "back to top" link work the same as before,
  including scrolling to the right spot when "Team" navigates from another
  page to `/about#team` (see `src/components/layout/ScrollManager.jsx`).
