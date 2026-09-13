import { prefetchResource } from "../hooks/useResource";

// Every list resource a public page reads via useResource(resource) with
// no id — warming these means any page's data is already cached by the
// time the visitor actually navigates there.
const LIST_RESOURCES = ["navigation", "expertise", "case-studies", "contact", "site-configuration", "team", "values", "process-steps", "partners"];

// Every `pages` record (banner/intro copy) a route reads by slug.
const PAGE_SLUGS = ["home", "services", "case-studies", "contact", "team", "about", "partners", "terms"];

// Fire-and-forget background warm-up of every public page's CMS data, so a
// visitor's *first* click to any nav link is already a cache hit — not
// just repeat visits. These are small JSON requests (a CMS's content
// changes rarely, so pre-loading all of it is cheap), so this starts
// immediately rather than waiting for idle time: the sooner it starts, the
// smaller the window where a fast click still hits a cold cache.
export function prefetchPublicSite() {
  LIST_RESOURCES.forEach((resource) => prefetchResource(resource));
  PAGE_SLUGS.forEach((slug) => prefetchResource("pages", slug));
}
