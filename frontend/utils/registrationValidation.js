export const emptyInsuranceDetail = {
  provider: "",
  policyNumber: "",
  coverageAmount: "",
  expiryDate: "",
};

export const emptyVisit = {
  patientType: "GENERAL",
  departmentId: "",
  doctorId: "",
  reasonForVisit: "",
  insuranceDetail: { ...emptyInsuranceDetail },
};

export function validateVisit(values) {
  const errors = {};
  if (!values.patientType) errors.patientType = "Patient type is required";
  if (!values.departmentId) errors.departmentId = "Department is required";
  if (!values.doctorId) errors.doctorId = "Doctor is required";
  if (values.reasonForVisit?.length > 500) errors.reasonForVisit = "Reason for visit must not exceed 500 characters";

  if (values.patientType === "INSURANCE") {
    const insurance = values.insuranceDetail || emptyInsuranceDetail;
    if (!insurance.provider?.trim()) errors["insuranceDetail.provider"] = "Insurance provider is required";
    if (!insurance.policyNumber?.trim()) errors["insuranceDetail.policyNumber"] = "Policy number is required";
    const amount = Number(insurance.coverageAmount);
    if (!Number.isFinite(amount) || amount <= 0) errors["insuranceDetail.coverageAmount"] = "Coverage amount must be greater than zero";
    if (!insurance.expiryDate) errors["insuranceDetail.expiryDate"] = "Expiry date is required";
    else {
      const today = new Date();
      const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      if (insurance.expiryDate <= localToday) errors["insuranceDetail.expiryDate"] = "Insurance expiry date must be in the future";
    }
  }
  return errors;
}

export function toVisitPayload(values) {
  return {
    patientType: values.patientType,
    departmentId: Number(values.departmentId),
    doctorId: Number(values.doctorId),
    reasonForVisit: values.reasonForVisit?.trim() || null,
    insuranceDetail: values.patientType === "INSURANCE" ? {
      provider: values.insuranceDetail.provider.trim(),
      policyNumber: values.insuranceDetail.policyNumber.trim(),
      coverageAmount: Number(values.insuranceDetail.coverageAmount),
      expiryDate: values.insuranceDetail.expiryDate,
    } : null,
  };
}
