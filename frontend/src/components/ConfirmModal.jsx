import { useEffect, useRef } from 'react'
import { focusFirstInteractive, setPageScrollLocked } from '../utils/dom'

export default function ConfirmModal({ open, title, message, confirmLabel = 'Delete', busy, onConfirm, onCancel }) {
  const dialogRef = useRef(null)
  useEffect(() => {
    if (!open) return undefined
    setPageScrollLocked(true)
    focusFirstInteractive(dialogRef.current)
    const closeOnEscape = (event) => { if (event.key === 'Escape' && !busy) onCancel() }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      setPageScrollLocked(false)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open, busy, onCancel])

  if (!open) return null
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) onCancel()
    }}>
      <div className="modal-card confirm-card" role="dialog" aria-modal="true" aria-labelledby="confirm-title" ref={dialogRef}>
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className="button danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
