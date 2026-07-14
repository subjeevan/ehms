"use client";

export default function Alert({
  type = "info",
  children,
  onClose = null
}) {
  if (!children) return null;

  return (
    <div className={`alert alert-${type}`} role="alert">
      <span>{children}</span>
      {onClose && (
        <button
          type="button"
          className="alert-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
}
