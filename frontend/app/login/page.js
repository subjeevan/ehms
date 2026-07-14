"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Alert from "@/components/Alert";
import FormField from "@/components/FormField";

export default function LoginPage() {
  const { login, isAuthenticated, ready } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState({ from: "", expired: false });
  const [values, setValues] = useState({ username: "", password: "" });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const errors = useMemo(
    () => ({
      username: !values.username.trim()
        ? "Username is required"
        : values.username.trim().length < 3
          ? "Minimum 3 characters"
          : "",
      password: !values.password
        ? "Password is required"
        : values.password.length < 6
          ? "Minimum 6 characters"
          : ""
    }),
    [values]
  );

  const valid = !errors.username && !errors.password;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery({
      from: params.get("from") || "",
      expired: Boolean(params.get("expired"))
    });
  }, []);

  useEffect(() => {
    if (ready && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [ready, isAuthenticated, router]);

  const submit = async (event) => {
    event.preventDefault();
    setTouched({ username: true, password: true });
    setError("");
    if (!valid) return;

    setBusy(true);
    try {
      await login(values);
      router.replace(query.from?.startsWith("/") ? query.from : "/dashboard");
    } catch (requestError) {
      setError(
        requestError.status === 401
          ? "Invalid username or password"
          : requestError.message
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-visual-content">
          <div className="login-emblem">H</div>
          <span className="eyebrow light">Connected healthcare operations</span>
          <h1>One secure workspace for better hospital service.</h1>
          <p>
            Manage patient registration, demographic records, departments,
            doctors, users, and live operational summaries.
          </p>
          <div className="login-features">
            <span>✓ Role-based access</span>
            <span>✓ Live patient dashboard</span>
            <span>✓ Responsive clinical workflow</span>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={submit} noValidate>
          <div className="mobile-brand brand">
            <div className="brand-mark">H</div>
            <div><strong>Vision HMS</strong><span>Hospital Management</span></div>
          </div>

          <span className="eyebrow">Welcome back</span>
          <h2>Sign in to HMS</h2>
          <p className="muted">Enter your authorized account credentials.</p>

          {query.expired && (
            <Alert type="warning">Your session expired. Please sign in again.</Alert>
          )}
          {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}

          <FormField
            label="Username"
            name="username"
            value={values.username}
            onChange={(event) =>
              setValues({ ...values, username: event.target.value })
            }
            error={touched.username ? errors.username : ""}
            required
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            value={values.password}
            onChange={(event) =>
              setValues({ ...values, password: event.target.value })
            }
            error={touched.password ? errors.password : ""}
            required
          />

          <button className="button primary large full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in securely"}
          </button>

          <div className="demo-credentials">
            <strong>Demo accounts</strong>
            <span>Admin: <code>admin</code> / <code>Admin@123</code></span>
            <span>User: <code>user</code> / <code>User@123</code></span>
          </div>
        </form>
      </section>
    </main>
  );
}
