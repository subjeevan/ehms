const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

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

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      cache: "no-store"
    });
  } catch {
    throw new ApiError(
      "Cannot connect to the HMS server. Check that the Spring Boot backend is running on port 8080.",
      0
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const payload =
    response.status === 204
      ? null
      : contentType.includes("application/json")
        ? await response.json()
        : await response.text();

  if (!response.ok) {
    if (
      response.status === 401 &&
      path !== "/auth/login" &&
      typeof window !== "undefined"
    ) {
      localStorage.removeItem("hms_token");
      localStorage.removeItem("hms_user");
      window.dispatchEvent(new CustomEvent("hms:unauthorized"));
    }

    throw new ApiError(
      payload?.message || `Request failed with status ${response.status}`,
      response.status,
      payload?.fieldErrors,
      payload
    );
  }

  return payload;
}

export const authApi = {
  login: (credentials) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    }),
  me: () => apiFetch("/auth/me"),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
  changePassword: (data) =>
    apiFetch("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data)
    })
};

export const dashboardApi = {
  summary: () => apiFetch("/dashboard/summary"),
  earnings: () => apiFetch("/dashboard/earnings")
};

export const patientApi = {
  list: ({
    page = 0,
    size = 10,
    search = "",
    sortBy = "registeredAt",
    sortDir = "desc"
  } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      search: String(search),
      sortBy: String(sortBy),
      sortDir: String(sortDir)
    });
    return apiFetch(`/patients?${params}`);
  },
  get: (id) => apiFetch(`/patients/${id}`),
  create: (data) =>
    apiFetch("/patients", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  createWithBilling: (data) =>
    apiFetch("/patients/with-billing", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  update: (id, data) =>
    apiFetch(`/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),
  remove: (id) =>
    apiFetch(`/patients/${id}`, {
      method: "DELETE"
    })
};

export const departmentApi = {
  list: () => apiFetch("/departments"),
  create: (data) =>
    apiFetch("/departments", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  update: (id, data) =>
    apiFetch(`/departments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),
  remove: (id) => apiFetch(`/departments/${id}`, { method: "DELETE" })
};

export const doctorApi = {
  list: () => apiFetch("/doctors"),
  create: (data) =>
    apiFetch("/doctors", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  update: (id, data) =>
    apiFetch(`/doctors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),
  remove: (id) => apiFetch(`/doctors/${id}`, { method: "DELETE" })
};

export const settingApi = {
  list: () => apiFetch("/settings"),
  create: (data) =>
    apiFetch("/settings", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  update: (id, data) =>
    apiFetch(`/settings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),
  remove: (id) => apiFetch(`/settings/${id}`, { method: "DELETE" })
};

export const userApi = {
  list: () => apiFetch("/users"),
  create: (data) =>
    apiFetch("/users", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  setStatus: (id, enabled) =>
    apiFetch(`/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ enabled })
    }),
  remove: (id) => apiFetch(`/users/${id}`, { method: "DELETE" })
};

export const chargeApi = {
  list: () => apiFetch("/setup/charges"),
  get: (patientType) => apiFetch(`/setup/charges/${patientType}`),
  update: (patientType, data) =>
    apiFetch(`/setup/charges/${patientType}`, {
      method: "PUT",
      body: JSON.stringify(data)
    })
};

export async function exportPatientsToExcel(
  patients,
  filename = "patients.xlsx"
) {
  const XLSX = await import("xlsx");

  const rows = patients.map((patient) => ({
    ID: patient.id,
    "Full Name": patient.fullName,
    Gender: patient.gender,
    "Date of Birth": patient.dateOfBirth,
    "Contact Number": patient.contactNumber,
    Address: patient.address,
    "Patient Type": patient.patientType,
    "Amount Paid (¥)": patient.amountPaid || 0,
    "Registered At": patient.registeredAt,
    "Insurance Provider": patient.insuranceDetail?.provider || "-",
    "Policy Number": patient.insuranceDetail?.policyNumber || "-"
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 8 }, { wch: 20 }, { wch: 10 }, { wch: 12 },
    { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 15 },
    { wch: 18 }, { wch: 20 }, { wch: 15 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Patients");
  XLSX.writeFile(workbook, filename);
}
