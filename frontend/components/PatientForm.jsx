

"use client";

import { useState } from "react";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";
import {
  emptyInsuranceDetail,
  normalizePatient,
  toPatientPayload,
  validatePatient,
} from "@/utils/patientValidation";

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const patientTypeOptions = [
  { value: "GENERAL", label: "General" },
  { value: "PAYING", label: "Paying" },
  { value: "INSURANCE", label: "Insurance" },
];

function getLocalToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function PatientForm({
  initialValues,
  submitLabel = "Save patient",
  onSubmit,
  onCancel = null,
}) {
  const [values, setValues] = useState(() =>
    normalizePatient(initialValues),
  );

  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const [busy, setBusy] = useState(false);

  const isInsurance = values.patientType === "INSURANCE";
  const today = getLocalToday();

  const change = (event) => {
    const { name, value } = event.target;

    setValues((current) => {
      /*
       * Handle nested insurance fields:
       * insuranceDetail.provider
       * insuranceDetail.policyNumber
       * insuranceDetail.coverageAmount
       * insuranceDetail.expiryDate
       */
      if (name.startsWith("insuranceDetail.")) {
        const insuranceField = name.split(".")[1];

        return {
          ...current,
          insuranceDetail: {
            ...(current.insuranceDetail || emptyInsuranceDetail),
            [insuranceField]: value,
          },
        };
      }

      // Contact number accepts digits only.
      if (name === "contactNumber") {
        return {
          ...current,
          contactNumber: value
            .replace(/\D/g, "")
            .slice(0, 25),
        };
      }

      /*
       * Date must use YYYY-MM-DD.
       * The year section cannot contain more than four digits.
       */
      if (name === "dateOfBirth") {
        const yearPart = value.split("-")[0];

        if (yearPart.length > 4) {
          return current;
        }

        return {
          ...current,
          dateOfBirth: value,
        };
      }

      const updatedValues = {
        ...current,
        [name]: value,
      };

      /*
       * Remove insurance data when General or Paying
       * is selected.
       */
      if (
        name === "patientType" &&
        value !== "INSURANCE"
      ) {
        updatedValues.insuranceDetail = {
          ...emptyInsuranceDetail,
        };
      }

      return updatedValues;
    });

    setErrors((current) => {
      const updatedErrors = {
        ...current,
      };

      delete updatedErrors[name];

      if (
        name === "patientType" &&
        value !== "INSURANCE"
      ) {
        delete updatedErrors[
          "insuranceDetail.provider"
        ];

        delete updatedErrors[
          "insuranceDetail.policyNumber"
        ];

        delete updatedErrors[
          "insuranceDetail.coverageAmount"
        ];

        delete updatedErrors[
          "insuranceDetail.expiryDate"
        ];
      }

      return updatedErrors;
    });

    setRequestError("");
  };

  const submit = async (event) => {
    event.preventDefault();

    const validationErrors = validatePatient(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setRequestError("");
      return;
    }

    setErrors({});
    setRequestError("");
    setBusy(true);

    try {
      const payload = toPatientPayload(values);

      await onSubmit(payload);
    } catch (error) {
      const backendFieldErrors =
        error?.fieldErrors || {};

      setErrors(backendFieldErrors);

      setRequestError(
        error?.message ||
          "Patient registration failed",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="card patient-form"
      onSubmit={submit}
      noValidate
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            Demographic information
          </span>

          <h2>Patient details</h2>
        </div>

        <span className="required-note">
          * Required fields
        </span>
      </div>

      {requestError && (
        <Alert
          type="error"
          onClose={() => setRequestError("")}
        >
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
          max={today}
          required
        />

        <FormField
          label="Contact number"
          name="contactNumber"
          value={values.contactNumber}
          onChange={change}
          error={errors.contactNumber}
          type="tel"
          inputMode="numeric"
          minLength={8}
          maxLength={25}
          pattern="[0-9]{8,25}"
          placeholder="Enter 8 to 25 digits"
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

      {isInsurance && (
        <section className="nested-section">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">
                Coverage
              </span>

              <h3>Insurance information</h3>
            </div>
          </div>

          <div className="form-grid">
            <FormField
              label="Insurance provider"
              name="insuranceDetail.provider"
              value={
                values.insuranceDetail?.provider ||
                ""
              }
              onChange={change}
              error={
                errors[
                  "insuranceDetail.provider"
                ]
              }
              required
            />

            <FormField
              label="Policy number"
              name="insuranceDetail.policyNumber"
              value={
                values.insuranceDetail
                  ?.policyNumber || ""
              }
              onChange={change}
              error={
                errors[
                  "insuranceDetail.policyNumber"
                ]
              }
              required
            />

            <FormField
              label="Coverage amount"
              name="insuranceDetail.coverageAmount"
              value={
                values.insuranceDetail
                  ?.coverageAmount || ""
              }
              onChange={change}
              error={
                errors[
                  "insuranceDetail.coverageAmount"
                ]
              }
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter coverage amount"
              required
            />

            <FormField
              label="Insurance expiry date"
              name="insuranceDetail.expiryDate"
              value={
                values.insuranceDetail
                  ?.expiryDate || ""
              }
              onChange={change}
              error={
                errors[
                  "insuranceDetail.expiryDate"
                ]
              }
              type="date"
              min={today}
              required
            />
          </div>
        </section>
      )}

      <div className="form-actions">
        <button
          type="submit"
          className="button primary"
          disabled={busy}
        >
          {busy ? "Saving..." : submitLabel}
        </button>

        {onCancel && (
          <button
            type="button"
            className="button secondary"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}