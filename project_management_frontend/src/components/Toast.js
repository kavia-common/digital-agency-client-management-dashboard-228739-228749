import React, { useEffect, useMemo, useState } from "react";

let listeners = [];

// PUBLIC_INTERFACE
export function showToast({ type = "info", title = "Notice", message = "", timeoutMs = 3500 } = {}) {
  /** Global helper to show a toast/snackbar. */
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const toast = { id, type, title, message, timeoutMs };
  listeners.forEach((fn) => fn(toast));
  return id;
}

function subscribe(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((x) => x !== fn);
  };
}

// PUBLIC_INTERFACE
export function ToastHost() {
  /** Renders toast notifications. Place once near the app root. */
  const [items, setItems] = useState([]);

  useEffect(() => {
    return subscribe((toast) => {
      setItems((prev) => [toast, ...prev].slice(0, 4));
      window.setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== toast.id));
      }, toast.timeoutMs);
    });
  }, []);

  const rendered = useMemo(
    () =>
      items.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <div className="toast-title">
            <div>{t.title}</div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
              aria-label="Dismiss notification"
              type="button"
            >
              ✕
            </button>
          </div>
          {t.message ? <div className="toast-body">{t.message}</div> : null}
        </div>
      )),
    [items]
  );

  return <div className="toast-host">{rendered}</div>;
}
