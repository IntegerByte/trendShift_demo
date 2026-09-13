import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";

const ToastContext = createContext(null);

let nextId = 1;

// Central toast + confirm-dialog system for the whole admin panel, replacing
// the per-page "notice" divs and native window.confirm() popups that used
// to be duplicated across ResourceManager, SiteSettingsPage and
// PageContentEditor. success()/error() show a dismissible toast; confirm()
// returns a Promise<boolean> so a destructive action (delete) can `await`
// the user's choice instead of blocking on window.confirm.
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const push = useCallback(
    (type, message, duration) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, type, message }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      success: (message) => push("success", message, 4500),
      error: (message) => push("error", message, 8000),
      confirm: ({ title = "Are you sure?", message, confirmLabel = "Confirm", cancelLabel = "Cancel", danger = true }) =>
        new Promise((resolve) => {
          setDialog({ title, message, confirmLabel, cancelLabel, danger, resolve });
        }),
    }),
    [push]
  );

  function resolveDialog(result) {
    dialog?.resolve(result);
    setDialog(null);
  }

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div className="cms-toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={toast.type === "error" ? "cms-toast cms-toast--error" : "cms-toast"}>
            <span className="cms-toast__icon" aria-hidden="true">
              {toast.type === "error" ? "!" : "✓"}
            </span>
            <span className="cms-toast__body">{toast.message}</span>
            <button type="button" className="cms-toast__close" onClick={() => dismiss(toast.id)} aria-label="Dismiss">
              ×
            </button>
          </div>
        ))}
      </div>

      {dialog && (
        <div className="cms-modal-backdrop cms-confirm" role="dialog" aria-modal="true">
          <section className="cms-modal">
            <h2>{dialog.title}</h2>
            <p>{dialog.message}</p>
            <div className="cms-modal__actions">
              <button type="button" className="cms-button" onClick={() => resolveDialog(false)}>
                {dialog.cancelLabel}
              </button>
              <button
                type="button"
                className={dialog.danger ? "cms-button cms-button--danger" : "cms-button cms-button--primary"}
                onClick={() => resolveDialog(true)}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </section>
        </div>
      )}
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
