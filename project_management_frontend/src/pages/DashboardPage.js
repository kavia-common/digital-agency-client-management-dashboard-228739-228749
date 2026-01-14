import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { showToast } from "../components/Toast";

// PUBLIC_INTERFACE
export default function DashboardPage() {
  /** Dashboard analytics screen. */
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const a = await api.getAnalytics({ recent_limit: 5 });
      setAnalytics(a);
    } catch (e) {
      showToast({ type: "error", title: "Could not load analytics", message: e.message || "Try again." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = analytics?.counts;
  const statusPairs = useMemo(() => {
    const map = counts?.projects_by_status || {};
    return Object.keys(map)
      .sort()
      .map((k) => ({ status: k, count: map[k] }));
  }, [counts]);

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="toolbar">
        <div className="toolbar-left">
          <span className="pill">{loading ? "Loading…" : "Up to date"}</span>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-sm" type="button" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-3">
        <div className="card">
          <h3>Total Clients</h3>
          <div className="kpi-row">
            <div className="kpi">{counts?.total_clients ?? "—"}</div>
            <div className="spark" aria-hidden="true" />
          </div>
        </div>
        <div className="card">
          <h3>Total Projects</h3>
          <div className="kpi-row">
            <div className="kpi">{counts?.total_projects ?? "—"}</div>
            <div className="spark" aria-hidden="true" />
          </div>
        </div>
        <div className="card">
          <h3>Projects by Status</h3>
          <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
            {statusPairs.length ? (
              statusPairs.map((p) => (
                <div key={p.status} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--muted)" }}>{p.status}</span>
                  <strong>{p.count}</strong>
                </div>
              ))
            ) : (
              <div style={{ color: "var(--muted)", fontSize: 13 }}>No projects yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>Recent Clients</h3>
          <div className="table-wrap" style={{ marginTop: 10 }}>
            <table className="table" style={{ minWidth: 0 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {(analytics?.recent_clients || []).map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      <div className="muted">{c.email || c.phone || "—"}</div>
                    </td>
                    <td>{c.created_at ? new Date(c.created_at).toLocaleString() : "—"}</td>
                  </tr>
                ))}
                {!loading && !(analytics?.recent_clients || []).length ? (
                  <tr>
                    <td colSpan={2} style={{ color: "var(--muted)" }}>
                      No recent clients.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Recent Projects</h3>
          <div className="table-wrap" style={{ marginTop: 10 }}>
            <table className="table" style={{ minWidth: 0 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {(analytics?.recent_projects || []).map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{p.name}</div>
                      <div className="muted">{p.client_name || "Unassigned client"}</div>
                    </td>
                    <td>
                      <span className="badge">{p.status || "—"}</span>
                    </td>
                    <td>{p.created_at ? new Date(p.created_at).toLocaleString() : "—"}</td>
                  </tr>
                ))}
                {!loading && !(analytics?.recent_projects || []).length ? (
                  <tr>
                    <td colSpan={3} style={{ color: "var(--muted)" }}>
                      No recent projects.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
