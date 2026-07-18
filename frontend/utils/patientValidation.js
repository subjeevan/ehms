export const emptyInsuranceDetail = {
  provider: "",
  policyNumber: "",
  coverageAmount: "",
  expiryDate: "",
};

export const emptyPatient = {
  fullName: "",
  gender: "",
  dateOfBirth: "",
  contactNumber: "",
  address: "",
  patientType: "GENERAL",
  doctorId: "",
  insuranceDetail: {
    ...emptyInsuranceDetail,
  },
};

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isValidCalendarDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function normalizePatient(patient) {
  return {
    fullName: patient?.fullName || "",
    gender: patient?.gender || "",
    dateOfBirth: patient?.dateOfBirth || "",
    contactNumber: patient?.contactNumber || "",
    address: patient?.address || "",
    patientType: patient?.patientType || "GENERAL",
    doctorId:
      patient?.assignedDoctor?.id !== undefined &&
      patient?.assignedDoctor?.id !== null
        ? String(patient.assignedDoctor.id)
        : patient?.doctorId !== undefined && patient?.doctorId !== null
          ? String(patient.doctorId)
          : "",
    insuranceDetail: {
      provider: patient?.insuranceDetail?.provider || "",
      policyNumber: patient?.insuranceDetail?.policyNumber || "",
      coverageAmount:
        patient?.insuranceDetail?.coverageAmount !== undefined &&
        patient?.insuranceDetail?.coverageAmount !== null
          ? String(patient.insuranceDetail.coverageAmount)
          : "",
      expiryDate: patient?.insuranceDetail?.expiryDate || "",
    },
  };
}

export function validatePatient(values) {
  const errors = {};
  const today = getLocalDateString();
  const contactPattern = /^[0-9]{8,10}$/;
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!values.fullName?.trim()) {
    errors.fullName = "Full name is required";
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = "Full name must contain at least 2 characters";
  } else if (values.fullName.trim().length > 150) {
    errors.fullName = "Full name must not exceed 150 characters";
  }

  if (!values.gender) {
    errors.gender = "Gender is required";
  }

  if (!values.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required";
  } else if (!datePattern.test(values.dateOfBirth)) {
    errors.dateOfBirth = "Date must contain a four-digit year";
  } else if (!isValidCalendarDate(values.dateOfBirth)) {
    errors.dateOfBirth = "Enter a valid date of birth";
  } else if (values.dateOfBirth >= today) {
    errors.dateOfBirth = "Date of birth must be in the past";
  }

  const contactNumber = values.contactNumber?.trim() || "";

  if (!contactNumber) {
    errors.contactNumber = "Contact number is required";
  } else if (!contactPattern.test(contactNumber)) {
    errors.contactNumber =
      "Contact number must contain between 8 and 10 digits";
  }

  if (!values.address?.trim()) {
    errors.address = "Address is required";
  } else if (values.address.trim().length > 300) {
    errors.address = "Address must not exceed 300 characters";
  }

  if (!values.patientType) {
    errors.patientType = "Patient type is required";
  }

  if (values.patientType === "PAYING") {
    const doctorId = Number(values.doctorId);

    if (!values.doctorId || !Number.isInteger(doctorId) || doctorId <= 0) {
      errors.doctorId = "Select a doctor for the paying patient";
    }
  }

  if (values.patientType === "INSURANCE") {
    const insurance =
      values.insuranceDetail || emptyInsuranceDetail;

    if (!insurance.provider?.trim()) {
      errors["insuranceDetail.provider"] =
        "Insurance provider is required";
    }

    if (!insurance.policyNumber?.trim()) {
      errors["insuranceDetail.policyNumber"] =
        "Policy number is required";
    }

    const coverageAmount = Number(
      insurance.coverageAmount,
    );

    if (
      insurance.coverageAmount === "" ||
      !Number.isFinite(coverageAmount) ||
      coverageAmount <= 0
    ) {
      errors["insuranceDetail.coverageAmount"] =
        "Coverage amount must be greater than zero";
    }

    if (!insurance.expiryDate) {
      errors["insuranceDetail.expiryDate"] =
        "Expiry date is required";
    } else if (
      !datePattern.test(insurance.expiryDate) ||
      !isValidCalendarDate(insurance.expiryDate)
    ) {
      errors["insuranceDetail.expiryDate"] =
        "Enter a valid insurance expiry date";
    } else if (insurance.expiryDate <= today) {
      errors["insuranceDetail.expiryDate"] =
        "Insurance expiry date must be in the future";
    }
  }

  return errors;
}

export function toPatientPayload(values) {
  const payload = {
    fullName: values.fullName.trim(),
    gender: values.gender,
    dateOfBirth: values.dateOfBirth,
    contactNumber: values.contactNumber.trim(),
    address: values.address.trim(),
    patientType: values.patientType,
    doctorId:
      values.patientType === "PAYING"
        ? Number(values.doctorId)
        : null,
    insuranceDetail: null,
  };

  if (values.patientType === "INSURANCE") {
    payload.insuranceDetail = {
      provider: values.insuranceDetail.provider.trim(),
      policyNumber: values.insuranceDetail.policyNumber.trim(),
      coverageAmount: Number(
        values.insuranceDetail.coverageAmount,
      ),
      expiryDate: values.insuranceDetail.expiryDate,
    };
  }

  return payload;
}
