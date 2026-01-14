/**
 * Tiny API client for the Project Management backend.
 *
 * Uses localStorage for token persistence.
 * Backend expects: Authorization: Bearer <token>
 */

const TOKEN_KEY = "pm_access_token";

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns backend base URL (must be configured as REACT_APP_API_BASE_URL). */
  return (process.env.REACT_APP_API_BASE_URL || "http://localhost:3001").replace(/\/+$/, "");
}

// PUBLIC_INTERFACE
export function getAccessToken() {
  /** Returns the stored access token, if any. */
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function setAccessToken(token) {
  /** Persist access token. */
  try {
    if (!token) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

// PUBLIC_INTERFACE
export function clearAccessToken() {
  /** Clears stored access token. */
  setAccessToken(null);
}

function buildHeaders({ token, json } = {}) {
  const headers = {};
  if (json) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function safeParseJson(resp) {
  const text = await resp.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractErrorMessage(payload) {
  if (!payload) return "Request failed";
  if (typeof payload === "string") return payload;
  if (payload.detail) return payload.detail;
  if (payload.message) return payload.message;
  return "Request failed";
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const base = getApiBaseUrl();
  const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const token = auth ? getAccessToken() : null;

  const resp = await fetch(url, {
    method,
    headers: buildHeaders({ token, json: body !== undefined }),
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (resp.status === 401) {
    // Token is invalid/expired. Clear it so the UI can redirect to login.
    clearAccessToken();
  }

  const payload = await safeParseJson(resp);

  if (!resp.ok) {
    const err = new Error(extractErrorMessage(payload));
    err.status = resp.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}

// PUBLIC_INTERFACE
export const api = {
  /** Auth */
  async register({ email, password }) {
    return request("/auth/register", { method: "POST", auth: false, body: { email, password } });
  },
  async login({ email, password }) {
    return request("/auth/login", { method: "POST", auth: false, body: { email, password } });
  },
  async me() {
    return request("/auth/me", { method: "GET", auth: true });
  },

  /** Dashboard */
  async getAnalytics({ recent_limit = 5 } = {}) {
    const qs = new URLSearchParams();
    if (recent_limit) qs.set("recent_limit", String(recent_limit));
    return request(`/dashboard/analytics?${qs.toString()}`, { method: "GET", auth: true });
  },

  /** Clients */
  async listClients({ page = 1, page_size = 50, sort_by = "created_at", sort_dir = "desc" } = {}) {
    const qs = new URLSearchParams({
      page: String(page),
      page_size: String(page_size),
      sort_by,
      sort_dir,
    });
    return request(`/clients?${qs.toString()}`, { method: "GET", auth: true });
  },
  async createClient(payload) {
    return request("/clients", { method: "POST", auth: true, body: payload });
  },
  async updateClient(id, payload) {
    return request(`/clients/${id}`, { method: "PUT", auth: true, body: payload });
  },
  async deleteClient(id) {
    return request(`/clients/${id}`, { method: "DELETE", auth: true });
  },

  /** Projects */
  async listProjects({
    page = 1,
    page_size = 50,
    sort_by = "created_at",
    sort_dir = "desc",
    client_id,
    status,
  } = {}) {
    const qs = new URLSearchParams({
      page: String(page),
      page_size: String(page_size),
      sort_by,
      sort_dir,
    });
    if (client_id !== undefined && client_id !== null && client_id !== "") qs.set("client_id", String(client_id));
    if (status) qs.set("status", String(status));
    return request(`/projects?${qs.toString()}`, { method: "GET", auth: true });
  },
  async createProject(payload) {
    return request("/projects", { method: "POST", auth: true, body: payload });
  },
  async updateProject(id, payload) {
    return request(`/projects/${id}`, { method: "PUT", auth: true, body: payload });
  },
  async deleteProject(id) {
    return request(`/projects/${id}`, { method: "DELETE", auth: true });
  },

  /** Settings */
  async getSettings() {
    return request("/settings", { method: "GET", auth: true });
  },
  async updateSettings(payload) {
    return request("/settings", { method: "PUT", auth: true, body: payload });
  },
};
