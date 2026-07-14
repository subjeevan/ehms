"use client";

import { useMemo, useState } from "react";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";
import { validatePatient } from "@/utils/patientValidation";

const genderOptions = ["MALE", "FEMALE", "OTHER"];
const patientTypeOptions = [
  { value: "GENERAL", label: "General" },
  { value: "PAYING", label: "Paying" },
  { value: "INSURANCE", label: "Insurance" }
];

export default function PatientForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel = null
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const [busy, setBusy] = useState(false);

  const insurance = values.patientType === "INSURANCE";

  const change = (event) => {
    const { name, value } = event.target;
    if (name === "provider" || name === "policyNumber") {
      setValues((current) => ({
        ...current,
        insuranceDetail: {
          ...current.insuranceDetail,
          [name]: value
        }
      }));
    } else {
      setValues((current) => ({ ...current, [name]: value }));
    }
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validatePatient(values);
    setErrors(nextErrors);
    setRequestError("");
    if (Object.keys(nextErrors).length) return;

    setBusy(true);
    try {
      await onSubmit(values);
    } catch (error) {
      setErrors(error.fieldErrors || {});
      setRequestError(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card patient-form" onSubmit={submit} noValidate>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Demographic information</span>
          <h2>Patient details</h2>
        </div>
        <span className="required-note">* Required fields</span>
      </div>

      {requestError && (
        <Alert type="error" onClose={() => setRequestError("")}>
          {requestError}
        </Alert>
      )}

      <div className="form-grid">
        <FormField
          label="Full name"
          name="fullName"
          value={values.fullName}
          onChange={change}
          error={errors.fullName}
          required
        />
        <FormField
          label="Gender"
          name="gender"
          value={values.gender}
          onChange={change}
          error={errors.gender}
          options={genderOptions}
          required
        />
        <FormField
          label="Date of birth"
          name="dateOfBirth"
          value={values.dateOfBirth}
          onChange={change}
          error={errors.dateOfBirth}
          type="date"
          required
        />
        <FormField
          label="Contact number"
          name="contactNumber"
          value={values.contactNumber}
          onChange={change}
          error={errors.contactNumber}
          required
        />
        <FormField
          label="Address"
          name="address"
          value={values.address}
          onChange={change}
          error={errors.address}
          textarea
          required
        />
        <FormField
          label="Patient type"
          name="patientType"
          value={values.patientType}
          onChange={change}
          error={errors.patientType}
          options={patientTypeOptions}
          required
        />
      </div>

      {insurance && (
        <section className="nested-section">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Coverage</span>
              <h3>Insurance information</h3>
            </div>
          </div>
          <div className="form-grid">
            <FormField
              label="Insurance provider"
              name="provider"
              value={values.insuranceDetail?.provider}
              onChange={change}
              error={errors.provider}
              required
            />
            <FormField
              label="Policy number"
              name="policyNumber"
              value={values.insuranceDetail?.policyNumber}
              onChange={change}
              error={errors.policyNumber}
              required
            />
          </div>
        </section>
      )}

      <div className="form-actions">
        <button className="button primary" disabled={busy}>
          {busy ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="button secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
