"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import Alert from "@/components/Alert";
import FormField from "@/components/FormField";
import Loading from "@/components/Loading";
import {
  departmentApi,
  doctorApi,
  settingApi
} from "@/lib/api";

const modules = {
  departments: {
    title: "Departments",
    api: departmentApi,
    empty: { name: "", description: "" }
  },
  doctors: {
    title: "Doctors",
    api: doctorApi,
    empty: { name: "", specialization: "" }
  },
  settings: {
    title: "Settings",
    api: settingApi,
    empty: { key: "", value: "" }
  }
};

function PageBody() {
  const [tab, setTab] = useState("departments");
  const [items, setItems] = useState([]);
  const [values, setValues] = useState(modules.departments.empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const config = modules[tab];

  const load = async () => {
    setLoading(true);
    try {
      const data = await config.api.list();
      setItems(Array.isArray(data) ? data : data.content || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setValues(config.empty);
    setEditing(null);
    setMessage("");
    setError("");
    load();
  }, [tab]);

  const change = (event) =>
    setValues({ ...values, [event.target.name]: event.target.value });

  const save = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      if (editing) {
        await config.api.update(editing.id, values);
      } else {
        await config.api.create(values);
      }
      setMessage(`${config.title.slice(0, -1)} saved successfully.`);
      setEditing(null);
      setValues(config.empty);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const edit = (item) => {
    setEditing(item);
    setValues(
      tab === "departments"
        ? { name: item.name || "", description: item.description || "" }
        : tab === "doctors"
          ? { name: item.name || item.fullName || "", specialization: item.specialization || "" }
          : { key: item.key || item.settingKey || "", value: item.value || item.settingValue || "" }
    );
  };

  const remove = async (item) => {
    if (!confirm(`Delete this ${config.title.slice(0, -1).toLowerCase()}?`)) return;
    try {
      await config.api.remove(item.id);
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
          <h1>Setup</h1>
          <p>Manage departments, doctors, and hospital settings.</p>
        </div>
      </header>

      <div className="tabs">
        {Object.entries(modules).map(([key, item]) => (
          <button
            key={key}
            type="button"
            className={tab === key ? "active" : ""}
            onClick={() => setTab(key)}
          >
            {item.title}
          </button>
        ))}
      </div>

      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <section className="setup-grid">
        <form className="card setup-form" onSubmit={save}>
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">{editing ? "Update" : "Create"}</span>
              <h2>{config.title.slice(0, -1)}</h2>
            </div>
          </div>

          {Object.keys(config.empty).map((field) => (
            <FormField
              key={field}
              label={field.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}
              name={field}
              value={values[field]}
              onChange={change}
              textarea={field === "description"}
              required
            />
          ))}

          <div className="form-actions">
            <button className="button primary">{editing ? "Update" : "Create"}</button>
            {editing && (
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setEditing(null);
                  setValues(config.empty);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <section className="card setup-list">
          <div className="section-heading">
            <div><span className="eyebrow">Configured</span><h2>{config.title}</h2></div>
          </div>
          {loading ? <Loading /> : (
            <div className="stack-list">
              {!items.length && <p className="muted">No records available.</p>}
              {items.map((item) => (
                <article key={item.id}>
                  <div>
                    <strong>{item.name || item.fullName || item.key || item.settingKey}</strong>
                    <p>{item.description || item.specialization || item.value || item.settingValue}</p>
                  </div>
                  <div className="row-actions">
                    <button className="text-button" onClick={() => edit(item)}>Edit</button>
                    <button className="text-button danger-text" onClick={() => remove(item)}>Delete</button>
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

export default function SetupPage() {
  return <AdminGuard><PageBody /></AdminGuard>;
}
