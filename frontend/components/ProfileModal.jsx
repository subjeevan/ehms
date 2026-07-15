"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/Alert";
import FormField from "@/components/FormField";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const emptyPassword = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/;

function displayValue(value) {
  return value || "Not set";
}

export default function ProfileModal({ open, onClose }) {
  const router = useRouter();
  const { user, refreshUser, logout } = useAuth();
  const [tab, setTab] = useState("details");
  const [values, setValues] = useState(emptyPassword);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [requestError, setRequestError] = useState("");
  const [busy, setBusy] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  const fullName = useMemo(() => {
    const name = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return name || user?.username || "User";
  }, [user]);

  useEffect(() => {
    if (!open) return;

    setTab("details");
    setValues(emptyPassword);
    setErrors({});
    setMessage("");
    setRequestError("");
    setPasswordChanged(false);

    refreshUser().catch((error) => {
      setRequestError(error.message || "Could not refresh profile.");
    });
  }, [open, refreshUser]);

  if (!open) return null;

  const change = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setRequestError("");
  };

  const submitPassword = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!values.currentPassword) {
      nextErrors.currentPassword = "Current password is required";
    }

    if (!passwordPattern.test(values.newPassword)) {
      nextErrors.newPassword =
        "Use 8-64 characters with uppercase, lowercase, number and special character";
    }

    if (values.newPassword !== values.confirmNewPassword) {
      nextErrors.confirmNewPassword = "Passwords do not match";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setBusy(true);
    setRequestError("");
    setMessage("");

    try {
      const result = await authApi.changePassword(values);
      setMessage(result?.message || "Password changed successfully.");
      setValues(emptyPassword);
      setPasswordChanged(true);
    } catch (error) {
      setErrors(error.fieldErrors || {});
      setRequestError(error.message || "Could not change password.");
    } finally {
      setBusy(false);
    }
  };

  const signInAgain = async () => {
    await logout();
    onClose();
    router.replace("/login");
  };

  return (
    <div className="enhancement-modal-backdrop" role="presentation">
      <section
        className="enhancement-modal profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
      >
        <header className="enhancement-modal-header">
          <div>
            <span className="eyebrow">My account</span>
            <h2 id="profile-title">{fullName}</h2>
          </div>
          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close profile"
          >
            ×
          </button>
        </header>

        <div className="profile-tabs" role="tablist">
          <button
            type="button"
            className={tab === "details" ? "active" : ""}
            onClick={() => setTab("details")}
          >
            Profile details
          </button>
          <button
            type="button"
            className={tab === "password" ? "active" : ""}
            onClick={() => setTab("password")}
          >
            Change password
          </button>
        </div>

        {requestError && <Alert type="error">{requestError}</Alert>}
        {message && <Alert type="success">{message}</Alert>}

        {tab === "details" ? (
          <dl className="profile-detail-grid">
            <div>
              <dt>Username</dt>
              <dd>{displayValue(user?.username)}</dd>
            </div>
            <div>
              <dt>First name</dt>
              <dd>{displayValue(user?.firstName)}</dd>
            </div>
            <div>
              <dt>Last name</dt>
              <dd>{displayValue(user?.lastName)}</dd>
            </div>
            <div>
              <dt>Contact number</dt>
              <dd>{displayValue(user?.contactNumber)}</dd>
            </div>
            <div>
              <dt>Gender</dt>
              <dd>{displayValue(user?.gender)}</dd>
            </div>
            <div>
              <dt>Date of birth</dt>
              <dd>{displayValue(user?.dateOfBirth)}</dd>
            </div>
            <div>
              <dt>Department</dt>
              <dd>{displayValue(user?.department?.name)}</dd>
            </div>
            <div>
              <dt>Roles</dt>
              <dd>{(user?.roles || []).join(", ") || "Not set"}</dd>
            </div>
          </dl>
        ) : passwordChanged ? (
          <div className="password-success-panel">
            <h3>Password updated</h3>
            <p>For account security, sign in again using your new password.</p>
            <button
              type="button"
              className="button primary"
              onClick={signInAgain}
            >
              Sign in again
            </button>
          </div>
        ) : (
          <form className="profile-password-form" onSubmit={submitPassword}>
            <FormField
              label="Current password"
              name="currentPassword"
              type="password"
              value={values.currentPassword}
              onChange={change}
              error={errors.currentPassword}
              required
            />
            <FormField
              label="New password"
              name="newPassword"
              type="password"
              value={values.newPassword}
              onChange={change}
              error={errors.newPassword}
              required
            />
            <FormField
              label="Confirm new password"
              name="confirmNewPassword"
              type="password"
              value={values.confirmNewPassword}
              onChange={change}
              error={errors.confirmNewPassword}
              required
            />

            <div className="form-actions">
              <button
                type="submit"
                className="button primary"
                disabled={busy}
              >
                {busy ? "Updating..." : "Change password"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
