import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { Modal } from "../components/Modal";
import { showToast } from "../components/Toast";
import { downloadCsv } from "../utils/csv";
import { requiredText } from "../utils/validation";

function normalizeClientPayload({ name, email, phone, company, notes } = {}) {
  return {
    name: String(name || "").trim(),
    email: String(email || "").trim() || null,
    phone: String(phone || "").trim() || null,
    company: String(company || "").trim() || null,
    notes: String(notes || "").trim() || null,
  };
}

// PUBLIC_INTERFACE
export default function ClientsPage() {
  /** Clients listing + create/update/delete + CSV export. */
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await api.listClients({ page: 1, page_size: 200, sort_by: "created_at", sort_dir: "desc" });
      setItems(list || []);
    } catch (e) {
      showToast({ type: "error", title: "Could not load clients", message: e.message || "Try again." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone: "", company: "", notes: "" });
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name || "",
      email: c.email || "",
      phone: c.phone || "",
      company: c.company || "",
      notes: c.notes || "",
    });
    setModalOpen(true);
  };

  const errors = useMemo(() => {
    return {
      name: requiredText(form.name, "Name"),
    };
  }, [form.name]);

  const canSave = !errors.name && !saving;

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const payload = normalizeClientPayload(form);
      if (editing) {
        const updated = await api.updateClient(editing.id, payload);
        setItems((prev) => prev.map((x) => (x.id === editing.id ? updated : x)));
        showToast({ type: "success", title: "Client updated", message: updated?.name || "" });
      } else {
        const created = await api.createClient(payload);
        setItems((prev) => [created, ...prev]);
        showToast({ type: "success", title: "Client created", message: created?.name || "" });
      }
      setModalOpen(false);
    } catch (e) {
      showToast({ type: "error", title: "Save failed", message: e.message || "Try again." });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (c) => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm(`Delete client "${c.name}"? This also deletes its projects.`);
    if (!ok) return;

    try {
      await api.deleteClient(c.id);
      setItems((prev) => prev.filter((x) => x.id !== c.id));
      showToast({ type: "success", title: "Client deleted", message: c.name });
    } catch (e) {
      showToast({ type: "error", title: "Delete failed", message: e.message || "Try again." });
    }
  };

  const onExport = () => {
    downloadCsv(
      "clients.csv",
      items,
      [
        { key: "id", header: "id" },
        { key: "name", header: "name" },
        { key: "company", header: "company" },
        { key: "email", header: "email" },
        { key: "phone", header: "phone" },
        { key: "notes", header: "notes" },
        { key: "created_at", header: "created_at" },
        { key: "updated_at", header: "updated_at" },
      ]
    );
    showToast({ type: "success", title: "Export started", message: "clients.csv downloaded." });
  };

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-left">
          <span className="pill">{loading ? "Loading…" : `${items.length} clients`}</span>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-sm" type="button" onClick={load} disabled={loading}>
            Refresh
          </button>
          <button className="btn btn-sm" type="button" onClick={onExport} disabled={!items.length}>
            Export CSV
          </button>
          <button className="btn btn-primary btn-sm" type="button" onClick={openCreate}>
            + New Client
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Company</th>
              <th>Contact</th>
              <th>Created</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ fontWeight: 800 }}>{c.name}</div>
                  <div className="muted">{c.notes ? String(c.notes).slice(0, 60) : "—"}</div>
                </td>
                <td>{c.company || <span style={{ color: "var(--muted)" }}>—</span>}</td>
                <td>
                  <div>{c.email || <span style={{ color: "var(--muted)" }}>—</span>}</div>
                  <div className="muted">{c.phone || "—"}</div>
                </td>
                <td>{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
                <td>
                  <div className="actions">
                    <button className="btn btn-sm" type="button" onClick={() => openEdit(c)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-danger" type="button" onClick={() => onDelete(c)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !items.length ? (
              <tr>
                <td colSpan={5} style={{ color: "var(--muted)" }}>
                  No clients yet. Create your first client.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {modalOpen ? (
        <Modal
          title={editing ? "Edit Client" : "New Client"}
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
                Company
                <input
                  className="input"
                  value={form.company}
                  onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                />
              </label>
              <label className="label">
                Phone
                <input className="input" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </label>
            </div>
            <label className="label">
              Email
              <input className="input" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </label>
            <label className="label">
              Notes
              <textarea
                className="textarea"
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              />
            </label>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
