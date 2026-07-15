"use client";

import { useEffect, useMemo, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import Alert from "@/components/Alert";
import FormField from "@/components/FormField";
import Loading from "@/components/Loading";
import { departmentApi, userApi } from "@/lib/api";

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
];

const emptyUser = {
  firstName: "",
  lastName: "",
  contactNumber: "",
  gender: "",
  dateOfBirth: "",
  departmentId: "",
  username: "",
  password: "",
  roles: ["ROLE_USER"],
};

const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/;

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function validate(values) {
  const errors = {};

  if (values.firstName.trim().length < 2) {
    errors.firstName = "First name must contain at least 2 characters";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Last name is required";
  }

  if (!/^[0-9]{8,10}$/.test(values.contactNumber)) {
    errors.contactNumber = "Contact number must contain 8 to 10 digits";
  }

  if (!values.gender) {
    errors.gender = "Gender is required";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.dateOfBirth)) {
    errors.dateOfBirth = "Enter a date with a four-digit year";
  } else if (values.dateOfBirth >= getToday()) {
    errors.dateOfBirth = "Date of birth must be in the past";
  }

  if (!values.departmentId) {
    errors.departmentId = "Department is required";
  }

  if (values.username.trim().length < 3) {
    errors.username = "Username must contain at least 3 characters";
  }

  if (!passwordPattern.test(values.password)) {
    errors.password =
      "Use 8-64 characters with uppercase, lowercase, number and special character";
  }

  if (!values.roles.length) {
    errors.roles = "Select at least one role";
  }

  return errors;
}

function PageBody() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [values, setValues] = useState(emptyUser);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const departmentOptions = useMemo(
    () =>
      departments.map((department) => ({
        value: String(department.id),
        label: department.name,
      })),
    [departments],
  );

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const [userData, departmentData] = await Promise.all([
        userApi.list(),
        departmentApi.list(),
      ]);

      setUsers(Array.isArray(userData) ? userData : userData?.content || []);
      setDepartments(Array.isArray(departmentData) ? departmentData : []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const change = (event) => {
    const { name, value } = event.target;

    setValues((current) => {
      if (name === "contactNumber") {
        return {
          ...current,
          contactNumber: value.replace(/\D/g, "").slice(0, 10),
        };
      }

      if (name === "dateOfBirth") {
        const year = value.split("-")[0];
        if (year.length > 4) return current;
      }

      return { ...current, [name]: value };
    });

    setErrors((current) => ({ ...current, [name]: "" }));
    setError("");
    setMessage("");
  };

  const toggleRole = (role) => {
    setValues((current) => ({
      ...current,
      roles: current.roles.includes(role)
        ? current.roles.filter((item) => item !== role)
        : [...current.roles, role],
    }));

    setErrors((current) => ({ ...current, roles: "" }));
  };

  const submit = async (event) => {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setError("");
    setMessage("");

    if (Object.keys(nextErrors).length > 0) return;

    setBusy(true);

    try {
      await userApi.create({
        ...values,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        contactNumber: values.contactNumber.trim(),
        username: values.username.trim(),
        departmentId: Number(values.departmentId),
      });

      setMessage("User created successfully.");
      setValues(emptyUser);
      await load();
    } catch (requestError) {
      setErrors(requestError.fieldErrors || {});
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const status = async (user) => {
    try {
      await userApi.setStatus(user.id, !user.enabled);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const remove = async (user) => {
    if (!confirm(`Delete user ${user.username}?`)) return;

    try {
      await userApi.remove(user.id);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>User management</h1>
          <p>Create complete user profiles and maintain role-based access.</p>
        </div>
      </header>

      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <form className="card patient-form" onSubmit={submit} noValidate>
        <div className="section-heading">
          <div>
            <span className="eyebrow">New account</span>
            <h2>Create user</h2>
          </div>
          <span className="required-note">* Required fields</span>
        </div>

        <div className="form-grid">
          <FormField
            label="First name"
            name="firstName"
            value={values.firstName}
            onChange={change}
            error={errors.firstName}
            required
          />
          <FormField
            label="Last name"
            name="lastName"
            value={values.lastName}
            onChange={change}
            error={errors.lastName}
            required
          />
          <FormField
            label="Contact number"
            name="contactNumber"
            type="tel"
            inputMode="numeric"
            minLength={8}
            maxLength={10}
            value={values.contactNumber}
            onChange={change}
            error={errors.contactNumber}
            placeholder="8 to 10 digits"
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
            type="date"
            max={getToday()}
            value={values.dateOfBirth}
            onChange={change}
            error={errors.dateOfBirth}
            required
          />
          <FormField
            label="Department"
            name="departmentId"
            value={values.departmentId}
            onChange={change}
            error={errors.departmentId}
            options={departmentOptions}
            required
          />
          <FormField
            label="Username"
            name="username"
            value={values.username}
            onChange={change}
            error={errors.username}
            required
          />
          <FormField
            label="Temporary password"
            name="password"
            type="password"
            value={values.password}
            onChange={change}
            error={errors.password}
            required
          />
        </div>

        <fieldset className="roles-fieldset">
          <legend>Roles *</legend>
          <div className="role-options">
            {["ROLE_USER", "ROLE_ADMIN"].map((role) => (
              <label key={role}>
                <input
                  type="checkbox"
                  checked={values.roles.includes(role)}
                  onChange={() => toggleRole(role)}
                />
                {role}
              </label>
            ))}
          </div>
          {errors.roles && <small className="field-error">{errors.roles}</small>}
        </fieldset>

        <div className="form-actions">
          <button className="button primary" type="submit" disabled={busy}>
            {busy ? "Creating..." : "Create user"}
          </button>
        </div>
      </form>

      <section className="card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Accounts</span>
            <h2>System users</h2>
          </div>
        </div>

        {loading ? (
          <Loading label="Loading users..." />
        ) : (
          <div className="table-scroll">
            <table className="data-table user-management-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Gender / DOB</th>
                  <th>Department</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const fullName = [user.firstName, user.lastName]
                    .filter(Boolean)
                    .join(" ") || user.username;

                  return (
                    <tr key={user.id}>
                      <td>
                        <strong>{fullName}</strong>
                        <small className="table-subtext">@{user.username}</small>
                      </td>
                      <td>{user.contactNumber || "-"}</td>
                      <td>
                        {user.gender || "-"}
                        <small className="table-subtext">
                          {user.dateOfBirth || "Date not set"}
                        </small>
                      </td>
                      <td>{user.department?.name || "Not assigned"}</td>
                      <td>{(user.roles || []).join(", ")}</td>
                      <td>
                        <span className={user.enabled ? "status enabled" : "status disabled"}>
                          {user.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="button secondary small"
                            onClick={() => status(user)}
                          >
                            {user.enabled ? "Disable" : "Enable"}
                          </button>
                          <button
                            type="button"
                            className="button danger small"
                            onClick={() => remove(user)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default function UserManagementPage() {
  return (
    <AdminGuard>
      <PageBody />
    </AdminGuard>
  );
}
