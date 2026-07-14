"use client";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Delete",
  busy = false,
  onCancel,
  onConfirm
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card confirm-card" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <span className="eyebrow">Confirmation</span>
            <h2>{title}</h2>
          </div>
          <button className="icon-button" onClick={onCancel} aria-label="Close">×</button>
        </div>
        <p className="muted">{message}</p>
        <div className="modal-actions">
          <button className="button secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className="button danger" onClick={onConfirm} disabled={busy}>
            {busy ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
