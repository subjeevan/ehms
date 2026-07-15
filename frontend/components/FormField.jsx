"use client";

export default function FormField({
                                      label,
                                      name,
                                      value,
                                      onChange,
                                      error = "",
                                      required = false,
                                      options = null,
                                      textarea = false,
                                      ...inputProps
                                  }) {
    const errorId = `${name}-error`;

    return (
        <div
            className={`form-field ${
                error ? "has-error" : ""
            }`}
        >
            <label htmlFor={name}>
                {label}

                {required && (
                    <span className="required"> *</span>
                )}
            </label>

            {options ? (
                <select
                    id={name}
                    name={name}
                    value={value ?? ""}
                    onChange={onChange}
                    required={required}
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                        error ? errorId : undefined
                    }
                    {...inputProps}
                >
                    <option value="">
                        Select {label.toLowerCase()}
                    </option>

                    {options.map((option) => {
                        const optionValue =
                            typeof option === "string"
                                ? option
                                : option.value;

                        const optionLabel =
                            typeof option === "string"
                                ? option
                                : option.label;

                        return (
                            <option
                                key={optionValue}
                                value={optionValue}
                            >
                                {optionLabel}
                            </option>
                        );
                    })}
                </select>
            ) : textarea ? (
                <textarea
                    id={name}
                    name={name}
                    value={value ?? ""}
                    onChange={onChange}
                    required={required}
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                        error ? errorId : undefined
                    }
                    {...inputProps}
                />
            ) : (
                <input
                    id={name}
                    name={name}
                    value={value ?? ""}
                    onChange={onChange}
                    required={required}
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                        error ? errorId : undefined
                    }
                    {...inputProps}
                />
            )}

            {error && (
                <small
                    id={errorId}
                    className="field-error"
                >
                    {error}
                </small>
            )}
        </div>
    );
}