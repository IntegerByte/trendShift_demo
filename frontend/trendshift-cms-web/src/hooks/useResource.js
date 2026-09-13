import { useEffect, useState } from "react";
import { cmsApi } from "../services/cmsApi";

// Module-level (persists across component mount/unmount, i.e. across route
// navigations, for the lifetime of the SPA session — cleared on a full page
// reload). This is a CMS: content changes rarely, so re-fetching from
// scratch on every navigation just to show the same thing a moment later
// is wasted latency and a visible flash back to "loading". Cache it.
const cache = new Map();

function cacheKey(resource, id) {
  return `${resource}:${id ?? "__list__"}`;
}

// Warms the same cache the hook below reads from, without mounting a
// component — used to pre-load content in the background (see
// src/app/prefetch.js) before the user actually navigates to a page that
// needs it, so that first visit is a cache hit too, not just repeat ones.
// Fire-and-forget: a failure here is harmless, the owning page's own
// useResource call will just fetch (and handle errors) normally.
export async function prefetchResource(resource, id = null) {
  const key = cacheKey(resource, id);
  if (cache.has(key)) return;
  try {
    const result = await (id ? cmsApi.get(resource, id) : cmsApi.list(resource));
    cache.set(key, result?.results || result);
  } catch {
    // Ignored — this is only ever a background warm-up.
  }
}

// Shared data-fetching state machine for public pages, so every page gets
// consistent loading/empty/error handling instead of each one reinventing
// it. `status` is one of: "loading" | "ready" | "empty" | "error".
//
// Stale-while-revalidate: if this resource was already fetched earlier in
// the session, render that immediately (no loading flash) while a fresh
// copy is fetched in the background and swapped in silently if it changed.
export function useResource(resource, { id = null, deps = [] } = {}) {
  const key = cacheKey(resource, id);
  const cached = cache.get(key);

  const [status, setStatus] = useState(cached ? "ready" : "loading");
  const [data, setData] = useState(cached ?? (id ? null : []));

  useEffect(() => {
    let cancelled = false;
    const hadCache = cache.has(key);
    if (!hadCache) setStatus("loading");

    const request = id ? cmsApi.get(resource, id) : cmsApi.list(resource);

    request
      .then((result) => {
        if (cancelled) return;
        const value = result?.results || result;
        cache.set(key, value);
        setData(value);
        setStatus(id ? (value ? "ready" : "empty") : value.length === 0 ? "empty" : "ready");
      })
      .catch(() => {
        if (cancelled) return;
        // Already showing cached content — a failed background refresh
        // shouldn't rip that away, just leave it as-is.
        if (!hadCache) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, id, key, ...deps]);

  return { status, data };
}
