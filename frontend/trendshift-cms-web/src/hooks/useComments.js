import { useCallback, useState } from "react";

function loadComments(storageKey, seed) {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) return JSON.parse(raw);
  } catch {
    // localStorage unavailable (private mode, etc.) — fall back to seed.
  }
  return seed;
}

function persistComments(storageKey, comments) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(comments));
  } catch {
    // Ignore persistence errors (storage full, disabled, etc.)
  }
}

// This project ships as a static SPA with no backend, so comments are a
// client-side demo only, scoped to this browser via localStorage.
// TODO: backend — persist comments server-side with moderation before this
// ships as a real public commenting feature.
export default function useComments(pageKey, seed = []) {
  const storageKey = `trendshift-comments-${pageKey}`;
  const [comments, setComments] = useState(() => loadComments(storageKey, seed));

  const addComment = useCallback(
    (comment) => {
      setComments((prev) => {
        const next = [...prev, comment];
        persistComments(storageKey, next);
        return next;
      });
    },
    [storageKey]
  );

  return { comments, addComment };
}
