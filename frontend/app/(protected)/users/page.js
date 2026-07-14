"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import Alert from "@/components/Alert";
import FormField from "@/components/FormField";
import Loading from "@/components/Loading";
import { userApi } from "@/lib/api";

function PageBody() {
  const [users, setUsers] = useState([]);
  const [values, setValues] = useState({
    username: "",
    password: "",
    roles: ["ROLE_USER"]
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await userApi.list();
      setUsers(Array.isArray(data) ? data : data.content || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await userApi.create(values);
      setMessage("User created successfully.");
      setValues({ username: "", password: "", roles: ["ROLE_USER"] });
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const toggleRole = (role) => {
    setValues((current) => ({
      ...current,
      roles: current.roles.includes(role)
        ? current.roles.filter((item) => item !== role)
        : [...current.roles, role]
    }));
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
          <p>Create accounts and maintain role-based access.</p>
        </div>
      </header>

      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <section className="setup-grid">
        <form className="card setup-form" onSubmit={submit}>
          <span className="eyebrow">New account</span>
          <h2>Create user</h2>
          <FormField label="Username" name="username" value={values.username} onChange={(event) => setValues({ ...values, username: event.target.value })} required />
          <FormField label="Temporary password" name="password" type="password" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} required />
          <fieldset className="checkbox-group">
            <legend>Roles</legend>
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
          </fieldset>
          <button className="button primary">Create user</button>
        </form>

        <section className="card setup-list">
          <div className="section-heading">
            <div><span className="eyebrow">Accounts</span><h2>System users</h2></div>
          </div>
          {loading ? <Loading /> : (
            <div className="stack-list">
              {users.map((user) => (
                <article key={user.id}>
                  <div className="user-list-info">
                    <span className="avatar">{user.username?.slice(0, 1).toUpperCase()}</span>
                    <div>
                      <strong>{user.username}</strong>
                      <div className="tag-row">
                        {(user.roles || []).map((role) => <span className="tag" key={role}>{role}</span>)}
                        <span className={`tag ${user.enabled ? "enabled" : "disabled"}`}>
                          {user.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="row-actions">
                    <button className="text-button" onClick={() => status(user)}>
                      {user.enabled ? "Disable" : "Enable"}
                    </button>
                    <button className="text-button danger-text" onClick={() => remove(user)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

export default function UserManagementPage() {
  return <AdminGuard><PageBody /></AdminGuard>;
}
