export default function FormField({ label, error = '', required = false, children, hint = '' }) {
  return (
    <label className={`form-field ${error ? 'has-error' : ''}`}>
      <span className="field-label">{label}{required && <span className="required"> *</span>}</span>
      {children}
      {hint && !error && <small className="field-hint">{hint}</small>}
      {error && <small className="field-error">{error}</small>}
    </label>
  )
}
