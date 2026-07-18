"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import Alert from "@/components/Alert";
import FormField from "@/components/FormField";
import Loading from "@/components/Loading";
import {
  departmentApi,
  doctorApi,
  settingApi,
} from "@/lib/api";

const modules = {
  departments: {
    title: "Departments",
    api: departmentApi,
    empty: {
      name: "",
      description: "",
    },
    toPayload: (values) => ({
      name: values.name.trim(),
      description: values.description.trim(),
    }),
    fromItem: (item) => ({
      name: item.name || "",
      description: item.description || "",
    }),
  },

  doctors: {
    title: "Doctors",
    api: doctorApi,
    empty: {
      fullName: "",
      specialization: "",
      contactNumber: "",
      departmentId: "",
    },
    toPayload: (values) => ({
      fullName: values.fullName.trim(),
      specialization:
        values.specialization.trim(),
      contactNumber:
        values.contactNumber.trim(),
      departmentIds: [
        Number(values.departmentId),
      ],
    }),
    fromItem: (item) => ({
      fullName: item.fullName || "",
      specialization:
        item.specialization || "",
      contactNumber:
        item.contactNumber || "",
      departmentId:
        item.departments?.[0]?.id !==
          undefined &&
        item.departments?.[0]?.id !== null
          ? String(item.departments[0].id)
          : "",
    }),
  },

  settings: {
    title: "Settings",
    api: settingApi,
    empty: {
      key: "",
      value: "",
    },
    toPayload: (values) => ({
      settingKey: values.key.trim(),
      settingValue: values.value.trim(),
    }),
    fromItem: (item) => ({
      key: item.key || item.settingKey || "",
      value:
        item.value || item.settingValue || "",
    }),
  },
};

function toItems(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  return [];
}

function PageBody() {
  const [tab, setTab] =
    useState("departments");
  const [items, setItems] = useState([]);
  const [departments, setDepartments] =
    useState([]);
  const [values, setValues] = useState({
    ...modules.departments.empty,
  });
  const [editing, setEditing] =
    useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] =
    useState("");
  const [loading, setLoading] =
    useState(true);

  const config = modules[tab];

  const load = async () => {
    setLoading(true);

    try {
      if (tab === "doctors") {
        const [doctorData, departmentData] =
          await Promise.all([
            doctorApi.list(),
            departmentApi.list(),
          ]);

        setItems(toItems(doctorData));
        setDepartments(toItems(departmentData));
      } else {
        const data = await config.api.list();
        setItems(toItems(data));
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setValues({
      ...config.empty,
    });
    setEditing(null);
    setMessage("");
    setError("");
    load();
  }, [tab]);

  const change = (event) => {
    const { name, value } = event.target;

    setValues((current) => ({
      ...current,
      [name]:
        tab === "doctors" &&
        name === "contactNumber"
          ? value
              .replace(/\D/g, "")
              .slice(0, 10)
          : value,
    }));
  };

  const save = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (
      tab === "doctors" &&
      !values.departmentId
    ) {
      setError(
        "Select a department for the doctor.",
      );
      return;
    }

    try {
      const payload =
        config.toPayload(values);

      if (editing) {
        await config.api.update(
          editing.id,
          payload,
        );
      } else {
        await config.api.create(payload);
      }

      setMessage(
        `${config.title.slice(0, -1)} saved successfully.`,
      );
      setEditing(null);
      setValues({
        ...config.empty,
      });
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const edit = (item) => {
    setEditing(item);
    setValues(config.fromItem(item));
    setMessage("");
    setError("");
  };

  const remove = async (item) => {
    if (
      !confirm(
        `Delete this ${config.title
          .slice(0, -1)
          .toLowerCase()}?`,
      )
    ) {
      return;
    }

    try {
      await config.api.remove(item.id);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const departmentOptions = departments.map(
    (department) => ({
      value: String(department.id),
      label: department.name,
    }),
  );

  const renderFormFields = () => {
    if (tab === "departments") {
      return (
        <>
          <FormField
            label="Name"
            name="name"
            value={values.name}
            onChange={change}
            required
          />

          <FormField
            label="Description"
            name="description"
            value={values.description}
            onChange={change}
            textarea
            required
          />
        </>
      );
    }

    if (tab === "doctors") {
      return (
        <>
          <FormField
            label="Doctor name"
            name="fullName"
            value={values.fullName}
            onChange={change}
            required
          />

          <FormField
            label="Specialization"
            name="specialization"
            value={values.specialization}
            onChange={change}
            required
          />

          <FormField
            label="Contact number"
            name="contactNumber"
            value={values.contactNumber}
            onChange={change}
            type="tel"
            inputMode="numeric"
            minLength={8}
            maxLength={10}
            pattern="[0-9]{8,10}"
            placeholder="Enter 8 to 10 digits"
            required
          />

          <FormField
            label="Department"
            name="departmentId"
            value={values.departmentId}
            onChange={change}
            options={departmentOptions}
            disabled={
              departmentOptions.length === 0
            }
            required
          />

          {departmentOptions.length === 0 && (
            <p className="muted">
              Create at least one department
              before adding a doctor.
            </p>
          )}
        </>
      );
    }

    return (
      <>
        <FormField
          label="Key"
          name="key"
          value={values.key}
          onChange={change}
          required
        />

        <FormField
          label="Value"
          name="value"
          value={values.value}
          onChange={change}
          required
        />
      </>
    );
  };

  const itemDescription = (item) => {
    if (tab === "departments") {
      return item.description || "";
    }

    if (tab === "doctors") {
      const departmentNames = Array.isArray(
        item.departments,
      )
        ? item.departments
            .map((department) => department.name)
            .filter(Boolean)
            .join(", ")
        : "";

      return [
        item.specialization,
        item.contactNumber,
        departmentNames,
      ]
        .filter(Boolean)
        .join(" • ");
    }

    return (
      item.value ||
      item.settingValue ||
      ""
    );
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">
            Administration
          </span>
          <h1>Setup</h1>
          <p>
            Manage departments, doctors, and
            hospital settings.
          </p>
        </div>
      </header>

      <div className="tabs">
        {Object.entries(modules).map(
          ([key, item]) => (
            <button
              key={key}
              type="button"
              className={
                tab === key ? "active" : ""
              }
              onClick={() => setTab(key)}
            >
              {item.title}
            </button>
          ),
        )}
      </div>

      {message && (
        <Alert type="success">
          {message}
        </Alert>
      )}

      {error && (
        <Alert type="error">{error}</Alert>
      )}

      <section className="setup-grid">
        <form
          className="card setup-form"
          onSubmit={save}
        >
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">
                {editing ? "Update" : "Create"}
              </span>
              <h2>
                {config.title.slice(0, -1)}
              </h2>
            </div>
          </div>

          {renderFormFields()}

          <div className="form-actions">
            <button
              className="button primary"
              disabled={
                tab === "doctors" &&
                departmentOptions.length === 0
              }
            >
              {editing ? "Update" : "Create"}
            </button>

            {editing && (
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setEditing(null);
                  setValues({
                    ...config.empty,
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <section className="card setup-list">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                Configured
              </span>
              <h2>{config.title}</h2>
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : (
            <div className="stack-list">
              {!items.length && (
                <p className="muted">
                  No records available.
                </p>
              )}

              {items.map((item) => (
                <article key={item.id}>
                  <div>
                    <strong>
                      {item.name ||
                        item.fullName ||
                        item.key ||
                        item.settingKey}
                    </strong>
                    <p>
                      {itemDescription(item)}
                    </p>
                  </div>

                  <div className="row-actions">
                    <button
                      className="text-button"
                      onClick={() => edit(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="text-button danger-text"
                      onClick={() => remove(item)}
                    >
                      Delete
                    </button>
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
  return (
    <AdminGuard>
      <PageBody />
    </AdminGuard>
  );
}
