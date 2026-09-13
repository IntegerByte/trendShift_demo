const API_ROOT = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

function humanizeFieldName(field) {
  if (field === "non_field_errors" || field === "__all__") return "";
  const spaced = field.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// DRF error responses come in a few different shapes depending on what
// failed: {"detail": "..."} for auth/permission/not-found errors, or
// {"field_name": ["message", ...], ...} for serializer validation errors —
// the latter was previously falling through to a generic fallback message
// since only `detail` was checked, which is why a validation failure (a
// blank required field, a duplicate slug, an over-length value, etc.)
// never told the user which field was the problem.
function describeApiError(body, fallback) {
  if (!body || typeof body !== "object") return fallback;
  if (typeof body.detail === "string" && body.detail) return body.detail;
  const parts = Object.entries(body)
    .map(([field, messages]) => {
      const text = Array.isArray(messages) ? messages.join(" ") : String(messages);
      const label = humanizeFieldName(field);
      return label ? `${label}: ${text}` : text;
    })
    .filter(Boolean);
  return parts.length ? parts.join(" ") : fallback;
}

async function request(path, options = {}) {
  const token = localStorage.getItem("trendshift_cms_token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers.Authorization = `Token ${token}`;
  let response;
  try {
    response = await fetch(`${API_ROOT}${path}`, { ...options, headers });
  } catch {
    throw new Error("Couldn't reach the CMS server. Check your connection and that the API is running, then try again.");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(describeApiError(body, `The server rejected this request (${response.status}). Please try again.`));
  }
  return response.status === 204 ? null : response.json();
}

// Multipart requests (image/file uploads) — no Content-Type header, so the
// browser sets the correct multipart boundary itself.
async function uploadRequest(path, formData, method = "POST") {
  const token = localStorage.getItem("trendshift_cms_token");
  const headers = {};
  if (token) headers.Authorization = `Token ${token}`;
  let response;
  try {
    response = await fetch(`${API_ROOT}${path}`, { method, headers, body: formData });
  } catch {
    throw new Error("Couldn't reach the CMS server. Check your connection and that the API is running, then try again.");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(describeApiError(body, `The upload was rejected (${response.status}). Check the file type and size, then try again.`));
  }
  return response.json();
}

export const cmsApi = {
  login: async (username, password) => {
    const response = await fetch(`${API_ROOT}/auth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error("The username or password is incorrect.");
    const data = await response.json();
    localStorage.setItem("trendshift_cms_token", data.token);
    return data;
  },
  logout: () => localStorage.removeItem("trendshift_cms_token"),
  // Current user's identity + CMS role ("admin" read-only, "super_admin"
  // full access) — used to gate write controls in the UI to match what
  // the backend will actually allow.
  getMe: () => request(`/auth/me/`),
  changePassword: async (currentPassword, newPassword) => {
    const data = await request(`/auth/change-password/`, {
      method: "POST",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    // The old token is revoked server-side on a successful change, so the
    // new one must replace it immediately or the next request 401s.
    if (data?.token) localStorage.setItem("trendshift_cms_token", data.token);
    return data;
  },
  list: (resource) => request(`/${resource}/`),
  get: (resource, id) => request(`/${resource}/${id}/`),
  save: (resource, payload, id) => request(`/${resource}/${id ? `${id}/` : ""}`, { method: id ? "PUT" : "POST", body: JSON.stringify(payload) }),
  update: (resource, id, payload) => request(`/${resource}/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  remove: (resource, id) => request(`/${resource}/${id}/`, { method: "DELETE" }),
  // Uploads an image for the rich text editor's insert-image button; returns { url }.
  uploadMedia: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return uploadRequest("/media/upload/", formData);
  },
  // Uploads a file directly onto a record's image/file field (og_image, image, logo, ...).
  uploadField: (resource, id, field, file) => {
    const formData = new FormData();
    formData.append(field, file);
    return uploadRequest(`/${resource}/${id}/`, formData, "PATCH");
  },
};
