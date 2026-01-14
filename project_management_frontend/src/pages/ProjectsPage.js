import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { Modal } from "../components/Modal";
import { showToast } from "../components/Toast";
import { downloadCsv } from "../utils/csv";
import { requiredText } from "../utils/validation";

const STATUS_OPTIONS = ["planned", "in_progress", "blocked", "completed"];

function normalizeProjectPayload({ name, description, status, client_id, due_date } = {}) {
  const cid = client_id === "" || client_id === null || client_id === undefined ? null : Number(client_id);
  return {
    name: String(name || "").trim(),
    description: String(description || "").trim() || null,
    status: String(status || "").trim() || "planned",
    client_id: Number.isFinite(cid) ? cid : null,
    // backend expects date or null; send ISO date if filled
    due_date: due_date ? String(due_date) : null,
  };
}

// PUBLIC_INTERFACE
export default function ProjectsPage() {
  /** Projects listing + create/update/delete + CSV export. */
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterClientId, setFilterClientId] = useState("");

  const [form, setForm] = useState({ name: "", description: "", status: "planned", client_id: "", due_date: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [projectList, clientList] = await Promise.all([
        api.listProjects({ page: 1, page_size: 200, sort_by: "created_at", sort_dir: "desc", status: filterStatus || undefined, client_id: filterClientId || undefined }),
        api.listClients({ page: 1, page_size: 200, sort_by: "name", sort_dir: "asc" }),
      ]);
      setItems(projectList || []);
      setClients(clientList || []);
    } catch (e) {
      showToast({ type: "error", title: "Could not load projects", message: e.message || "Try again." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterClientId]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", status: "planned", client_id: "", due_date: "" });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || "",
      description: p.description || "",
      status: p.status || "planned",
      client_id: p.client_id ?? "",
      due_date: p.due_date ? String(p.due_date).slice(0, 10) : "",
    });
    setModalOpen(true);
  };

  const errors = useMemo(() => ({ name: requiredText(form.name, "Name") }), [form.name]);
  const canSave = !errors.name && !saving;

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const payload = normalizeProjectPayload(form);
      if (editing) {
        const updated = await api.updateProject(editing.id, payload);
        setItems((prev) => prev.map((x) => (x.id === editing.id ? updated : x)));
        showToast({ type: "success", title: "Project updated", message: updated?.name || "" });
      } else {
        const created = await api.createProject(payload);
        setItems((prev) => [created, ...prev]);
        showToast({ type: "success", title: "Project created", message: created?.name || "" });
      }
      setModalOpen(false);
    } catch (e) {
      showToast({ type: "error", title: "Save failed", message: e.message || "Try again." });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (p) => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm(`Delete project "${p.name}"?`);
    if (!ok) return;

    try {
      await api.deleteProject(p.id);
      setItems((prev) => prev.filter((x) => x.id !== p.id));
      showToast({ type: "success", title: "Project deleted", message: p.name });
    } catch (e) {
      showToast({ type: "error", title: "Delete failed", message: e.message || "Try again." });
    }
  };

  const clientNameById = useMemo(() => {
    const map = new Map();
    clients.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [clients]);

  const onExport = () => {
    downloadCsv(
      "projects.csv",
      items,
      [
        { key: "id", header: "id" },
        { key: "name", header: "name" },
        { key: "status", header: "status" },
        { key: "client_id", header: "client_id" },
        { key: "client_name", header: "client_name", value: (row) => row.client_name || clientNameById.get(row.client_id) || "" },
        { key: "due_date", header: "due_date" },
        { key: "description", header: "description" },
        { key: "created_at", header: "created_at" },
        { key: "updated_at", header: "updated_at" },
      ]
    );
    showToast({ type: "success", title: "Export started", message: "projects.csv downloaded." });
  };

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-left">
          <span className="pill">{loading ? "Loading…" : `${items.length} projects`}</span>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ color: "var(--muted)", fontSize: 13 }}>Status</span>
            <select className="select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ color: "var(--muted)", fontSize: 13 }}>Client</span>
            <select className="select" value={filterClientId} onChange={(e) => setFilterClientId(e.target.value)}>
              <option value="">All</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="toolbar-right">
          <button className="btn btn-sm" type="button" onClick={load} disabled={loading}>
            Refresh
          </button>
          <button className="btn btn-sm" type="button" onClick={onExport} disabled={!items.length}>
            Export CSV
          </button>
          <button className="btn btn-primary btn-sm" type="button" onClick={openCreate}>
            + New Project
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Client</th>
              <th>Status</th>
              <th>Due</th>
              <th>Created</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ fontWeight: 800 }}>{p.name}</div>
                  <div className="muted">{p.description ? String(p.description).slice(0, 60) : "—"}</div>
                </td>
                <td>{p.client_name || (p.client_id ? clientNameById.get(p.client_id) : null) || <span style={{ color: "var(--muted)" }}>Unassigned</span>}</td>
                <td><span className="badge">{p.status || "—"}</span></td>
                <td>{p.due_date ? new Date(p.due_date).toLocaleDateString() : <span style={{ color: "var(--muted)" }}>—</span>}</td>
                <td>{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</td>
                <td>
                  <div className="actions">
                    <button className="btn btn-sm" type="button" onClick={() => openEdit(p)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-danger" type="button" onClick={() => onDelete(p)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !items.length ? (
              <tr>
                <td colSpan={6} style={{ color: "var(--muted)" }}>
                  No projects yet. Create your first project.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {modalOpen ? (
        <Modal
          title={editing ? "Edit Project" : "New Project"}
          onClose={() => (saving ? null : setModalOpen(false))}
          footer={
            <>
              <button className="btn" type="button" onClick={() => setModalOpen(false)} disabled={saving}>
                Cancel
              </button>
              <button className="btn btn-primary" type="button" onClick={onSave} disabled={!canSave}>
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          }
        >
          <div className="form-grid">
            <label className="label">
              Name *
              <input className="input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              {errors.name ? <span className="error-text">{errors.name}</span> : null}
            </label>

            <div className="grid grid-2">
              <label className="label">
                Status
                <select className="select" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="label">
                Due date
                <input className="input" type="date" value={form.due_date} onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))} />
              </label>
            </div>

            <label className="label">
              Client
              <select className="select" value={form.client_id} onChange={(e) => setForm((p) => ({ ...p, client_id: e.target.value }))}>
                <option value="">Unassigned</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>

            <label className="label">
              Description
              <textarea className="textarea" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </label>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
