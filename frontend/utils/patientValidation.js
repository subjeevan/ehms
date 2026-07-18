export const emptyPatient = {
  fullName: "",
  gender: "",
  dateOfBirth: "",
  contactNumber: "",
  address: "",
};

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidCalendarDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function normalizePatient(patient) {
  return {
    fullName: patient?.fullName || "",
    gender: patient?.gender || "",
    dateOfBirth: patient?.dateOfBirth || "",
    contactNumber: patient?.contactNumber || "",
    address: patient?.address || "",
  };
}

export function validatePatient(values) {
  const errors = {};
  const today = getLocalDateString();
  const contactPattern = /^[0-9]{8,10}$/;
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!values.fullName?.trim()) errors.fullName = "Full name is required";
  else if (values.fullName.trim().length < 2) errors.fullName = "Full name must contain at least 2 characters";
  else if (values.fullName.trim().length > 150) errors.fullName = "Full name must not exceed 150 characters";

  if (!values.gender) errors.gender = "Gender is required";

  if (!values.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
  else if (!datePattern.test(values.dateOfBirth)) errors.dateOfBirth = "Date must contain a four-digit year";
  else if (!isValidCalendarDate(values.dateOfBirth)) errors.dateOfBirth = "Enter a valid date of birth";
  else if (values.dateOfBirth >= today) errors.dateOfBirth = "Date of birth must be in the past";

  const contact = values.contactNumber?.trim() || "";
  if (!contact) errors.contactNumber = "Contact number is required";
  else if (!contactPattern.test(contact)) errors.contactNumber = "Contact number must contain between 8 and 10 digits";

  if (!values.address?.trim()) errors.address = "Address is required";
  else if (values.address.trim().length > 300) errors.address = "Address must not exceed 300 characters";

  return errors;
}

export function toPatientPayload(values) {
  return {
    fullName: values.fullName.trim(),
    gender: values.gender,
    dateOfBirth: values.dateOfBirth,
    contactNumber: values.contactNumber.trim(),
    address: values.address.trim(),
  };
}
