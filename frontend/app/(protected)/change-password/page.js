"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";
import Alert from "@/components/Alert";
import FormField from "@/components/FormField";

export default function ChangePasswordPage() {
  const [values, setValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
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

    if (values.newPassword.length < 6) {
      setError("New password must contain at least 6 characters.");
      return;
    }
    if (values.newPassword !== values.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setBusy(true);
    try {
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      setMessage("Password changed successfully.");
      setValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-stack narrow-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Account security</span>
          <h1>Change password</h1>
          <p>Update the password for your HMS account.</p>
        </div>
      </header>

      <form className="card account-form" onSubmit={submit}>
        {message && <Alert type="success">{message}</Alert>}
        {error && <Alert type="error">{error}</Alert>}
        <FormField label="Current password" name="currentPassword" type="password" value={values.currentPassword} onChange={change} required />
        <FormField label="New password" name="newPassword" type="password" value={values.newPassword} onChange={change} required />
        <FormField label="Confirm new password" name="confirmPassword" type="password" value={values.confirmPassword} onChange={change} required />
        <button className="button primary" disabled={busy}>{busy ? "Updating..." : "Change password"}</button>
      </form>
    </div>
  );
}
