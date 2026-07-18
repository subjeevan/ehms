const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export class ApiError extends Error {
  constructor(message, status = 0, fieldErrors = {}, payload = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors || {};
    this.payload = payload;
  }
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("hms_token");
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers, cache: "no-store" });
  } catch {
    throw new ApiError("Cannot connect to the HMS server. Check that the Spring Boot backend is running on port 8080.", 0);
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = response.status === 204 ? null : contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    if (response.status === 401 && path !== "/auth/login" && typeof window !== "undefined") {
      localStorage.removeItem("hms_token");
      localStorage.removeItem("hms_user");
      window.dispatchEvent(new CustomEvent("hms:unauthorized"));
    }
    throw new ApiError(payload?.message || `Request failed with status ${response.status}`, response.status, payload?.fieldErrors, payload);
  }
  return payload;
}

export const authApi = {
  login: (credentials) => apiFetch("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  me: () => apiFetch("/auth/me"),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
  changePassword: (data) => apiFetch("/auth/change-password", { method: "POST", body: JSON.stringify(data) }),
};

export const dashboardApi = {
  summary: () => apiFetch("/dashboard/summary"),
  earnings: () => apiFetch("/dashboard/earnings"),
};

export const patientApi = {
  list: ({ page = 0, size = 10, search = "", sortBy = "registeredAt", sortDir = "desc" } = {}) => {
    const params = new URLSearchParams({ page: String(page), size: String(size), search: String(search), sortBy: String(sortBy), sortDir: String(sortDir) });
    return apiFetch(`/patients?${params}`);
  },
  get: (id) => apiFetch(`/patients/${id}`),
  getByMrn: (mrn) => apiFetch(`/patients/by-mrn/${encodeURIComponent(mrn)}`),
  lookup: (type, value) => {
    const params = new URLSearchParams({
      type: String(type),
      value: String(value),
    });
    return apiFetch(`/patients/lookup?${params}`);
  },
  visits: (id) => apiFetch(`/patients/${id}/visits`),
  update: (id, data) => apiFetch(`/patients/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => apiFetch(`/patients/${id}`, { method: "DELETE" }),
};

export const registrationApi = {
  registerNew: (data) => apiFetch("/registrations/new", { method: "POST", body: JSON.stringify(data) }),
  registerReturning: (data) => apiFetch("/registrations/returning", { method: "POST", body: JSON.stringify(data) }),
};

export const departmentApi = {
  list: () => apiFetch("/departments"),
  create: (data) => apiFetch("/departments", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/departments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => apiFetch(`/departments/${id}`, { method: "DELETE" }),
};

export const doctorApi = {
  list: (departmentId = "") => apiFetch(departmentId ? `/doctors?departmentId=${encodeURIComponent(departmentId)}` : "/doctors"),
  create: (data) => apiFetch("/doctors", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/doctors/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => apiFetch(`/doctors/${id}`, { method: "DELETE" }),
};

export const settingApi = {
  list: () => apiFetch("/settings"),
  create: (data) => apiFetch("/settings", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/settings/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => apiFetch(`/settings/${id}`, { method: "DELETE" }),
};

export const userApi = {
  list: () => apiFetch("/users"),
  create: (data) => apiFetch("/users", { method: "POST", body: JSON.stringify(data) }),
  setStatus: (id, enabled) => apiFetch(`/users/${id}/status`, { method: "PATCH", body: JSON.stringify({ enabled }) }),
  remove: (id) => apiFetch(`/users/${id}`, { method: "DELETE" }),
};

export const chargeApi = {
  list: () => apiFetch("/setup/charges"),
  get: (patientType) => apiFetch(`/setup/charges/${patientType}`),
  update: (patientType, data) => apiFetch(`/setup/charges/${patientType}`, { method: "PUT", body: JSON.stringify(data) }),
};

export async function exportPatientsToExcel(patients, filename = "patients.xlsx") {
  const XLSX = await import("xlsx");
  const rows = patients.map((patient) => ({
    ID: patient.id,
    MRN: patient.medicalRecordNumber,
    "Full Name": patient.fullName,
    Gender: patient.gender,
    "Date of Birth": patient.dateOfBirth,
    "Contact Number": patient.contactNumber,
    Address: patient.address,
    "Latest Patient Type": patient.patientType || "-",
    "Latest Department": patient.department?.name || "-",
    "Latest Doctor": patient.assignedDoctor?.fullName || "-",
    "Latest Visit Date": patient.latestVisitDate || "-",
    "Visit Count": patient.visitCount || 0,
    "Amount Paid (¥)": patient.amountPaid || 0,
    "Registered At": patient.registeredAt,
  }));
  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = Array(14).fill({ wch: 18 });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Patients");
  XLSX.writeFile(workbook, filename);
}

export const visitApi = {
  list: ({
    page = 0,
    size = 10,
    search = "",
    sortBy = "visitDate",
    sortDir = "desc",
  } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      search: String(search),
      sortBy: String(sortBy),
      sortDir: String(sortDir),
    });

    return apiFetch(`/visits?${params}`);
  },

  export: ({
    search = "",
    sortBy = "visitDate",
    sortDir = "desc",
  } = {}) => {
    const params = new URLSearchParams({
      search: String(search),
      sortBy: String(sortBy),
      sortDir: String(sortDir),
    });

    return apiFetch(`/visits/export?${params}`);
  },
};

function visitCategory(patientStatus) {
  return patientStatus === "RETURNING" ? "FOLLOW-UP" : "NEW";
}

export async function exportVisitsToExcel(
  visits,
  filename = "patient-visits.xlsx",
) {
  const XLSX = await import("xlsx");

  const rows = visits.map((visit) => ({
    "Visit Date": visit.visitDate,
    "Visit ID": visit.visitId,
    "Patient ID": visit.patientId,
    MRN: visit.medicalRecordNumber,
    "Full Name": visit.fullName,
    Gender: visit.gender,
    "Date of Birth": visit.dateOfBirth,
    "Mobile Number": visit.contactNumber,
    Address: visit.address,
    "Visit Category": visitCategory(visit.patientStatus),
    "Patient Type": visit.patientType,
    Department: visit.departmentName,
    Doctor: visit.doctorName,
    "Reason for Visit": visit.reasonForVisit || "-",
    "Insurance Provider": visit.insuranceProvider || "-",
    "Insurance Number": visit.insuranceNumber || "-",
    "Registered By": visit.registeredBy,
    "Registered At": visit.registeredAt,
    "Bill IDs": Array.isArray(visit.billIds) && visit.billIds.length
      ? visit.billIds.join(", ")
      : "-",
    "Billed Amount (¥)": visit.billedAmount || 0,
    "Paid Amount (¥)": visit.paidAmount || 0,
    "Billing Status": visit.billingStatus,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 13 },
    { wch: 10 },
    { wch: 11 },
    { wch: 20 },
    { wch: 22 },
    { wch: 10 },
    { wch: 14 },
    { wch: 15 },
    { wch: 24 },
    { wch: 15 },
    { wch: 14 },
    { wch: 20 },
    { wch: 22 },
    { wch: 28 },
    { wch: 20 },
    { wch: 20 },
    { wch: 16 },
    { wch: 20 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Patient Visits");
  XLSX.writeFile(workbook, filename);
}
