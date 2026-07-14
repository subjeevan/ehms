export const emptyPatient = {
  fullName: "",
  gender: "",
  dateOfBirth: "",
  contactNumber: "",
  address: "",
  patientType: "GENERAL",
  insuranceDetail: {
    provider: "",
    policyNumber: ""
  }
};

export function validatePatient(values) {
  const errors = {};
  if (!values.fullName?.trim()) errors.fullName = "Full name is required";
  if (!values.gender) errors.gender = "Gender is required";
  if (!values.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
  if (!values.contactNumber?.trim()) {
    errors.contactNumber = "Contact number is required";
  }
  if (!values.address?.trim()) errors.address = "Address is required";
  if (!values.patientType) errors.patientType = "Patient type is required";

  if (values.patientType === "INSURANCE") {
    if (!values.insuranceDetail?.provider?.trim()) {
      errors.provider = "Insurance provider is required";
    }
    if (!values.insuranceDetail?.policyNumber?.trim()) {
      errors.policyNumber = "Policy number is required";
    }
  }

  return errors;
}
