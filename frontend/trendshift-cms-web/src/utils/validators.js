// Shared validation helpers. These are client-side conveniences only —
// they improve UX, they are not a security boundary. Any backend that
// eventually receives this data must re-validate and sanitize it again.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^[0-9+\-()\s]{7,20}$/;

export function isValidEmail(value) {
  return EMAIL_RE.test(value.trim());
}

export function isValidPhone(value) {
  const trimmed = value.trim();
  return trimmed === "" || PHONE_RE.test(trimmed);
}

export function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  const initials = (parts[0]?.charAt(0) || "") + (parts[1]?.charAt(0) || "");
  return initials.toUpperCase() || "?";
}

export function formatCommentDate(date = new Date()) {
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
