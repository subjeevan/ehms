"use client";

export default function FormField({
  label,
  name,
  value,
  onChange,
  error = "",
  required = false,
  type = "text",
  options = [],
  textarea = false,
  placeholder = "",
  disabled = false,
  min,
  max,
  step,
  hint = ""
}) {
  const shared = {
    id: name,
    name,
    value: value ?? "",
    onChange,
    placeholder,
    disabled,
    "aria-invalid": Boolean(error)
  };

  return (
    <label className={`form-field ${error ? "has-error" : ""}`}>
      <span className="field-label">
        {label} {required && <span className="required">*</span>}
      </span>

      {textarea ? (
        <textarea {...shared} rows={4} />
      ) : options.length ? (
        <select {...shared}>
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((option) => {
            const item =
              typeof option === "string"
                ? { value: option, label: option }
                : option;
            return (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            );
          })}
        </select>
      ) : (
        <input {...shared} type={type} min={min} max={max} step={step} />
      )}

      {error ? (
        <small className="field-error">{error}</small>
      ) : hint ? (
        <small className="field-hint">{hint}</small>
      ) : null}
    </label>
  );
}
