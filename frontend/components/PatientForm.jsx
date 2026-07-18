"use client";

import { useEffect, useState } from "react";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";
import { doctorApi } from "@/lib/api";
import {
  emptyInsuranceDetail,
  normalizePatient,
  toPatientPayload,
  validatePatient,
} from "@/utils/patientValidation";

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
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
  const [doctors, setDoctors] = useState([]);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [doctorLoadError, setDoctorLoadError] = useState("");

  const isPaying = values.patientType === "PAYING";
  const isInsurance = values.patientType === "INSURANCE";
  const today = getLocalToday();

  useEffect(() => {
    let active = true;

    async function loadDoctors() {
      setDoctorLoading(true);
      setDoctorLoadError("");

      try {
        const data = await doctorApi.list();

        if (!active) {
          return;
        }

        setDoctors(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.content)
              ? data.content
              : [],
        );
      } catch (error) {
        if (active) {
          setDoctorLoadError(
            error?.message || "Could not load doctors",
          );
        }
      } finally {
        if (active) {
          setDoctorLoading(false);
        }
      }
    }

    loadDoctors();

    return () => {
      active = false;
    };
  }, []);

  const doctorOptions = doctors.map((doctor) => {
    const departmentNames = Array.isArray(doctor.departments)
      ? doctor.departments
          .map((department) => department.name)
          .filter(Boolean)
          .join(", ")
      : "";

    const details = [
      doctor.specialization,
      departmentNames,
    ]
      .filter(Boolean)
      .join(" — ");

    return {
      value: String(doctor.id),
      label: details
        ? `${doctor.fullName} — ${details}`
        : doctor.fullName,
    };
  });

  const change = (event) => {
    const { name, value } = event.target;

    setValues((current) => {
      if (name.startsWith("insuranceDetail.")) {
        const insuranceField = name.split(".")[1];

        return {
          ...current,
          insuranceDetail: {
            ...(current.insuranceDetail ||
              emptyInsuranceDetail),
            [insuranceField]: value,
          },
        };
      }

      if (name === "contactNumber") {
        return {
          ...current,
          contactNumber: value
            .replace(/\D/g, "")
            .slice(0, 10),
        };
      }

      if (name === "dateOfBirth") {
        const yearPart = value.split("-")[0];

        if (yearPart.length > 4) {
          return current;
        }
      }

      const updatedValues = {
        ...current,
        [name]: value,
      };

      if (
        name === "patientType" &&
        value !== "INSURANCE"
      ) {
        updatedValues.insuranceDetail = {
          ...emptyInsuranceDetail,
        };
      }

      if (
        name === "patientType" &&
        value !== "PAYING"
      ) {
        updatedValues.doctorId = "";
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

      if (
        name === "patientType" &&
        value !== "PAYING"
      ) {
        delete updatedErrors.doctorId;
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
      return;
    }

    setErrors({});
    setRequestError("");
    setBusy(true);

    try {
      await onSubmit(toPatientPayload(values));
    } catch (error) {
      setErrors(error?.fieldErrors || {});
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
          maxLength={10}
          pattern="[0-9]{8,10}"
          placeholder="Enter 8 to 10 digits"
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

      {isPaying && (
        <section className="nested-section">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">
                Consultation
              </span>
              <h3>Doctor assignment</h3>
            </div>
          </div>

          {doctorLoadError && (
            <Alert type="error">
              {doctorLoadError}
            </Alert>
          )}

          <div className="form-grid">
            <FormField
              label="Doctor"
              name="doctorId"
              value={values.doctorId}
              onChange={change}
              error={errors.doctorId}
              options={doctorOptions}
              disabled={
                doctorLoading ||
                doctorOptions.length === 0
              }
              required
            />
          </div>

          {!doctorLoading &&
            !doctorLoadError &&
            doctorOptions.length === 0 && (
              <p className="muted">
                No doctors are configured. An
                administrator must add a doctor and
                select a department in Setup.
              </p>
            )}
        </section>
      )}

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
