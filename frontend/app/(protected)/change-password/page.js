"use client";

import { useState } from "react";
import Alert from "@/components/Alert";
import FormField from "@/components/FormField";
import { authApi } from "@/lib/api";

export default function ChangePasswordPage() {
  const [values, setValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const change = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (values.newPassword !== values.confirmNewPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setBusy(true);

    try {
      const response = await authApi.changePassword(values);
      setMessage(response.message);
      setValues({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Account security</span>
          <h1>Change password</h1>
          <p>Update the password for your HMS account.</p>
        </div>
      </header>

      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <form className="card profile-password-form" onSubmit={submit}>
        <FormField
          label="Current password"
          name="currentPassword"
          type="password"
          value={values.currentPassword}
          onChange={change}
          required
        />
        <FormField
          label="New password"
          name="newPassword"
          type="password"
          value={values.newPassword}
          onChange={change}
          required
        />
        <FormField
          label="Confirm new password"
          name="confirmNewPassword"
          type="password"
          value={values.confirmNewPassword}
          onChange={change}
          required
        />
        <button className="button primary" disabled={busy}>
          {busy ? "Updating..." : "Change password"}
        </button>
      </form>
    </div>
  );
}
