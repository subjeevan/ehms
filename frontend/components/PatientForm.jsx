"use client";

import { useState } from "react";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";
import { normalizePatient, toPatientPayload, validatePatient } from "@/utils/patientValidation";

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
];

function getLocalToday() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

export default function PatientForm({ initialValues, submitLabel = "Save patient", onSubmit, onCancel = null }) {
  const [values, setValues] = useState(() => normalizePatient(initialValues));
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const [busy, setBusy] = useState(false);

  const change = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({
      ...current,
      [name]: name === "contactNumber" ? value.replace(/\D/g, "").slice(0, 10) : value,
    }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setRequestError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    const validationErrors = validatePatient(values);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setBusy(true);
    setErrors({});
    setRequestError("");
    try {
      await onSubmit(toPatientPayload(values));
    } catch (error) {
      setErrors(error?.fieldErrors || {});
      setRequestError(error?.message || "Patient update failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card patient-form" onSubmit={submit} noValidate>
      <div className="section-heading">
        <div><span className="eyebrow">Permanent information</span><h2>Patient demographics</h2></div>
        <span className="required-note">* Required fields</span>
      </div>
      {requestError && <Alert type="error" onClose={() => setRequestError("")}>{requestError}</Alert>}
      <div className="form-grid">
        <FormField label="Full name" name="fullName" value={values.fullName} onChange={change} error={errors.fullName} required />
        <FormField label="Gender" name="gender" value={values.gender} onChange={change} error={errors.gender} options={genderOptions} required />
        <FormField label="Date of birth" name="dateOfBirth" value={values.dateOfBirth} onChange={change} error={errors.dateOfBirth} type="date" max={getLocalToday()} required />
        <FormField label="Contact number" name="contactNumber" value={values.contactNumber} onChange={change} error={errors.contactNumber} type="tel" inputMode="numeric" minLength={8} maxLength={10} pattern="[0-9]{8,10}" required />
        <FormField label="Address" name="address" value={values.address} onChange={change} error={errors.address} textarea required />
      </div>
      <div className="form-actions">
        <button type="submit" className="button primary" disabled={busy}>{busy ? "Saving..." : submitLabel}</button>
        {onCancel && <button type="button" className="button secondary" onClick={onCancel} disabled={busy}>Cancel</button>}
      </div>
    </form>
  );
}
