"use client";

import { useEffect, useMemo, useState } from "react";
import Alert from "@/components/Alert";
import FormField from "@/components/FormField";
import {
  chargeApi,
  departmentApi,
  doctorApi,
  patientApi,
} from "@/lib/api";
import {
  emptyPatient,
  toPatientPayload,
  validatePatient,
} from "@/utils/patientValidation";
import {
  emptyInsuranceDetail,
  emptyVisit,
  toVisitPayload,
  validateVisit,
} from "@/utils/registrationValidation";

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
];

const patientTypeOptions = [
  { value: "GENERAL", label: "General" },
  { value: "PAYING", label: "Paying" },
  { value: "INSURANCE", label: "Insurance" },
];

const lookupTypeOptions = [
  { value: "PATIENT_ID", label: "Patient ID" },
  { value: "MRN", label: "MRN" },
  { value: "MOBILE", label: "Mobile number" },
  { value: "INSURANCE_NUMBER", label: "Insurance number" },
];

const lookupPlaceholders = {
  PATIENT_ID: "Example: 15",
  MRN: "Example: EHMS-2026-000015",
  MOBILE: "Enter 8 to 10 digits",
  INSURANCE_NUMBER: "Enter insurance policy number",
};

function localToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatCharge(amount) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return "Not configured";
  }

  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

export default function PatientRegistrationForm({
  onRegisterNew,
  onRegisterReturning,
}) {
  const [mode, setMode] = useState("NEW");
  const [patient, setPatient] = useState({
    ...emptyPatient,
  });
  const [visit, setVisit] = useState({
    ...emptyVisit,
    insuranceDetail: {
      ...emptyInsuranceDetail,
    },
  });

  const [lookupType, setLookupType] = useState("MRN");
  const [lookupValue, setLookupValue] = useState("");
  const [lookupResults, setLookupResults] = useState([]);
  const [foundPatient, setFoundPatient] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [charges, setCharges] = useState({});
  const [chargesLoaded, setChargesLoaded] = useState(false);

  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all([
      departmentApi.list(),
      chargeApi.list(),
    ])
      .then(([departmentData, chargeData]) => {
        if (!active) {
          return;
        }

        setDepartments(
          Array.isArray(departmentData)
            ? departmentData
            : departmentData?.content || [],
        );

        const chargeRows = Array.isArray(chargeData)
          ? chargeData
          : chargeData?.content || [];

        setCharges(
          chargeRows.reduce((result, item) => {
            result[item.patientType] = item;
            return result;
          }, {}),
        );
        setChargesLoaded(true);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!visit.departmentId) {
      setDoctors([]);
      setVisit((current) => ({
        ...current,
        doctorId: "",
      }));
      return () => {
        active = false;
      };
    }

    doctorApi
      .list(visit.departmentId)
      .then((data) => {
        if (!active) {
          return;
        }

        const rows = Array.isArray(data)
          ? data
          : data?.content || [];

        setDoctors(
          rows.filter((doctor) =>
            doctor.departments?.some(
              (department) =>
                String(department.id) ===
                String(visit.departmentId),
            ),
          ),
        );
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
        }
      });

    return () => {
      active = false;
    };
  }, [visit.departmentId]);

  const departmentOptions = useMemo(
    () =>
      departments.map((item) => ({
        value: String(item.id),
        label: item.name,
      })),
    [departments],
  );

  const doctorOptions = useMemo(
    () =>
      doctors.map((item) => ({
        value: String(item.id),
        label: `${item.fullName} — ${item.specialization}`,
      })),
    [doctors],
  );

  const selectedCharge = charges[visit.patientType];

  const changePatient = (event) => {
    const { name, value } = event.target;

    setPatient((current) => ({
      ...current,
      [name]:
        name === "contactNumber"
          ? value.replace(/\D/g, "").slice(0, 10)
          : value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const changeVisit = (event) => {
    const { name, value } = event.target;

    setVisit((current) => {
      if (name.startsWith("insuranceDetail.")) {
        return {
          ...current,
          insuranceDetail: {
            ...current.insuranceDetail,
            [name.split(".")[1]]: value,
          },
        };
      }

      const next = {
        ...current,
        [name]: value,
      };

      if (name === "departmentId") {
        next.doctorId = "";
      }

      if (
        name === "patientType" &&
        value !== "INSURANCE"
      ) {
        next.insuranceDetail = {
          ...emptyInsuranceDetail,
        };
      }

      return next;
    });

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const resetLookup = () => {
    setLookupValue("");
    setLookupResults([]);
    setFoundPatient(null);
    setErrors((current) => ({
      ...current,
      lookupValue: "",
      selectedPatient: "",
    }));
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setPatient({
      ...emptyPatient,
    });
    resetLookup();
    setVisit({
      ...emptyVisit,
      insuranceDetail: {
        ...emptyInsuranceDetail,
      },
    });
    setErrors({});
    setError("");
  };

  const changeLookupType = (event) => {
    setLookupType(event.target.value);
    resetLookup();
    setError("");
  };

  const changeLookupValue = (event) => {
    let value = event.target.value;

    if (
      lookupType === "PATIENT_ID" ||
      lookupType === "MOBILE"
    ) {
      value = value.replace(/\D/g, "");

      if (lookupType === "MOBILE") {
        value = value.slice(0, 10);
      }
    } else if (lookupType === "MRN") {
      value = value.toUpperCase();
    }

    setLookupValue(value);
    setLookupResults([]);
    setFoundPatient(null);
    setErrors((current) => ({
      ...current,
      lookupValue: "",
      selectedPatient: "",
    }));
  };

  const searchPatient = async () => {
    const value = lookupValue.trim();

    if (!value) {
      setErrors((current) => ({
        ...current,
        lookupValue: "Enter a value to search",
      }));
      return;
    }

    if (
      lookupType === "PATIENT_ID" &&
      (!/^\d+$/.test(value) || Number(value) <= 0)
    ) {
      setErrors((current) => ({
        ...current,
        lookupValue: "Enter a valid numeric patient ID",
      }));
      return;
    }

    if (
      lookupType === "MOBILE" &&
      !/^[0-9]{8,10}$/.test(value)
    ) {
      setErrors((current) => ({
        ...current,
        lookupValue:
          "Mobile number must contain 8 to 10 digits",
      }));
      return;
    }

    setSearching(true);
    setError("");

    try {
      const data = await patientApi.lookup(
        lookupType,
        value,
      );
      const rows = Array.isArray(data) ? data : [];

      setLookupResults(rows);
      setFoundPatient(
        rows.length === 1 ? rows[0] : null,
      );
      setErrors((current) => ({
        ...current,
        lookupValue: "",
        selectedPatient: "",
      }));
    } catch (requestError) {
      setLookupResults([]);
      setFoundPatient(null);
      setError(requestError.message);
    } finally {
      setSearching(false);
    }
  };

  const selectPatient = (event) => {
    const patientId = Number(event.target.value);
    const selected =
      lookupResults.find(
        (item) => item.id === patientId,
      ) || null;

    setFoundPatient(selected);
    setErrors((current) => ({
      ...current,
      selectedPatient: "",
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    const nextErrors = {
      ...validateVisit(visit),
    };

    if (mode === "NEW") {
      Object.assign(
        nextErrors,
        validatePatient(patient),
      );
    }

    if (
      mode === "RETURNING" &&
      !foundPatient
    ) {
      nextErrors.selectedPatient =
        "Search and select a returning patient first";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setBusy(true);
    setError("");

    try {
      if (mode === "NEW") {
        await onRegisterNew({
          patient: toPatientPayload(patient),
          visit: toVisitPayload(visit),
        });
      } else {
        await onRegisterReturning({
          medicalRecordNumber:
            foundPatient.medicalRecordNumber,
          visit: toVisitPayload(visit),
        });
      }
    } catch (requestError) {
      setErrors(requestError?.fieldErrors || {});
      setError(
        requestError?.message ||
          "Registration failed",
      );
    } finally {
      setBusy(false);
    }
  };

  const insurance = visit.insuranceDetail;

  return (
    <form
      className="card registration-window"
      onSubmit={submit}
      noValidate
    >
      <header className="registration-window-header">
        <div>
          <span className="eyebrow">
            Patient intake
          </span>
          <h1>Patient registration</h1>
        </div>

        <div
          className="registration-mode-tabs"
          role="tablist"
          aria-label="Registration mode"
        >
          <button
            type="button"
            className={
              mode === "NEW" ? "active" : ""
            }
            onClick={() => switchMode("NEW")}
          >
            New patient
          </button>
          <button
            type="button"
            className={
              mode === "RETURNING"
                ? "active"
                : ""
            }
            onClick={() =>
              switchMode("RETURNING")
            }
          >
            Returning patient
          </button>
        </div>
      </header>

      {error && (
        <Alert
          type="error"
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      <div className="registration-columns">
        <section className="registration-pane">
          <div className="registration-pane-heading">
            <div>
              <span className="eyebrow">
                {mode === "NEW"
                  ? "Saved once"
                  : "Existing patient"}
              </span>
              <h2>
                {mode === "NEW"
                  ? "Patient and visit details"
                  : "Find patient and add visit"}
              </h2>
            </div>
          </div>

          {mode === "NEW" ? (
            <div className="registration-compact-grid">
              <div className="registration-span-2">
                <FormField
                  label="Full name"
                  name="fullName"
                  value={patient.fullName}
                  onChange={changePatient}
                  error={errors.fullName}
                  required
                />
              </div>

              <FormField
                label="Gender"
                name="gender"
                value={patient.gender}
                onChange={changePatient}
                error={errors.gender}
                options={genderOptions}
                required
              />

              <FormField
                label="Date of birth"
                name="dateOfBirth"
                value={patient.dateOfBirth}
                onChange={changePatient}
                error={errors.dateOfBirth}
                type="date"
                max={localToday()}
                required
              />

              <FormField
                label="Mobile number"
                name="contactNumber"
                value={patient.contactNumber}
                onChange={changePatient}
                error={errors.contactNumber}
                type="tel"
                inputMode="numeric"
                minLength={8}
                maxLength={10}
                placeholder="8 to 10 digits"
                required
              />

              <FormField
                label="Address"
                name="address"
                value={patient.address}
                onChange={changePatient}
                error={errors.address}
                required
              />

              <div className="registration-span-2">
                <FormField
                  label="Reason for visit"
                  name="reasonForVisit"
                  value={visit.reasonForVisit}
                  onChange={changeVisit}
                  error={errors.reasonForVisit}
                  placeholder="Optional"
                />
              </div>
            </div>
          ) : (
            <div className="returning-patient-panel">
              <div className="patient-lookup-row">
                <FormField
                  label="Search by"
                  name="lookupType"
                  value={lookupType}
                  onChange={changeLookupType}
                  options={lookupTypeOptions}
                />

                <FormField
                  label="Search value"
                  name="lookupValue"
                  value={lookupValue}
                  onChange={changeLookupValue}
                  error={errors.lookupValue}
                  placeholder={
                    lookupPlaceholders[lookupType]
                  }
                  inputMode={
                    lookupType === "PATIENT_ID" ||
                    lookupType === "MOBILE"
                      ? "numeric"
                      : "text"
                  }
                />

                <button
                  type="button"
                  className="button secondary lookup-button"
                  onClick={searchPatient}
                  disabled={searching}
                >
                  {searching
                    ? "Searching..."
                    : "Search"}
                </button>
              </div>

              {lookupResults.length > 1 && (
                <FormField
                  label="Matching patient"
                  name="selectedPatient"
                  value={
                    foundPatient
                      ? String(foundPatient.id)
                      : ""
                  }
                  onChange={selectPatient}
                  error={errors.selectedPatient}
                  options={lookupResults.map(
                    (item) => ({
                      value: String(item.id),
                      label: `${item.fullName} — ${item.medicalRecordNumber} — ${item.contactNumber}`,
                    }),
                  )}
                  required
                />
              )}

              {foundPatient ? (
                <div className="selected-patient-summary">
                  <div>
                    <span>Patient</span>
                    <strong>
                      {foundPatient.fullName}
                    </strong>
                  </div>
                  <div>
                    <span>Patient ID</span>
                    <strong>
                      {foundPatient.id}
                    </strong>
                  </div>
                  <div>
                    <span>MRN</span>
                    <strong>
                      {
                        foundPatient.medicalRecordNumber
                      }
                    </strong>
                  </div>
                  <div>
                    <span>Mobile</span>
                    <strong>
                      {foundPatient.contactNumber}
                    </strong>
                  </div>
                  <div>
                    <span>Date of birth</span>
                    <strong>
                      {foundPatient.dateOfBirth}
                    </strong>
                  </div>
                  <div>
                    <span>Address</span>
                    <strong>
                      {foundPatient.address}
                    </strong>
                  </div>
                </div>
              ) : (
                <div className="selected-patient-placeholder">
                  Search by Patient ID, MRN, mobile
                  number, or insurance number.
                </div>
              )}

              <FormField
                label="Reason for visit"
                name="reasonForVisit"
                value={visit.reasonForVisit}
                onChange={changeVisit}
                error={errors.reasonForVisit}
                placeholder="Optional"
              />

              {errors.selectedPatient && (
                <small className="field-error">
                  {errors.selectedPatient}
                </small>
              )}
            </div>
          )}
        </section>

        <section className="registration-pane">
          <div className="registration-pane-heading">
            <div>
              <span className="eyebrow">
                Saved for this visit
              </span>
              <h2>
                Patient type and doctor
              </h2>
            </div>
          </div>

          <div className="registration-compact-grid">
            <FormField
              label="Patient type"
              name="patientType"
              value={visit.patientType}
              onChange={changeVisit}
              error={errors.patientType}
              options={patientTypeOptions}
              required
            />

            <div className="charge-display">
              <span>Registration charge</span>
              <strong>
                {!chargesLoaded
                  ? "Loading..."
                  : !selectedCharge
                    ? "Not configured"
                    : selectedCharge.enabled
                      ? formatCharge(
                          selectedCharge.amount,
                        )
                      : "Automatic billing disabled"}
              </strong>
              <small>
                {!selectedCharge
                  ? "Configure this charge in Setup"
                  : selectedCharge.enabled
                    ? `${visit.patientType} charge`
                    : "No automatic bill will be created"}
              </small>
            </div>

            <FormField
              label="Department"
              name="departmentId"
              value={visit.departmentId}
              onChange={changeVisit}
              error={errors.departmentId}
              options={departmentOptions}
              required
            />

            <FormField
              label="Doctor"
              name="doctorId"
              value={visit.doctorId}
              onChange={changeVisit}
              error={errors.doctorId}
              options={doctorOptions}
              disabled={
                !visit.departmentId ||
                doctorOptions.length === 0
              }
              required
            />
          </div>

          {visit.departmentId &&
            doctorOptions.length === 0 && (
              <p className="registration-inline-note">
                No doctor is assigned to this
                department. Configure the doctor in
                Setup.
              </p>
            )}

          {visit.patientType ===
            "INSURANCE" && (
            <div className="insurance-compact-block">
              <div className="registration-mini-heading">
                Insurance details
              </div>

              <div className="registration-compact-grid">
                <FormField
                  label="Provider"
                  name="insuranceDetail.provider"
                  value={insurance.provider}
                  onChange={changeVisit}
                  error={
                    errors[
                      "insuranceDetail.provider"
                    ]
                  }
                  required
                />

                <FormField
                  label="Insurance number"
                  name="insuranceDetail.policyNumber"
                  value={insurance.policyNumber}
                  onChange={changeVisit}
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
                  value={insurance.coverageAmount}
                  onChange={changeVisit}
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
                  label="Expiry date"
                  name="insuranceDetail.expiryDate"
                  value={insurance.expiryDate}
                  onChange={changeVisit}
                  error={
                    errors[
                      "insuranceDetail.expiryDate"
                    ]
                  }
                  type="date"
                  min={localToday()}
                  required
                />
              </div>
            </div>
          )}

          <div className="registration-submit-row">
            <div>
              <strong>
                {mode === "NEW"
                  ? "Create patient and first visit"
                  : "Create returning visit only"}
              </strong>
              <small>
                {mode === "NEW"
                  ? "A permanent MRN will be generated."
                  : "Patient demographics will not be duplicated."}
              </small>
            </div>

            <button
              className="button primary"
              disabled={
                busy ||
                (mode === "RETURNING" &&
                  !foundPatient)
              }
            >
              {busy
                ? "Saving..."
                : mode === "NEW"
                  ? "Register patient"
                  : "Register visit"}
            </button>
          </div>
        </section>
      </div>
    </form>
  );
}
